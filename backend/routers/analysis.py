# backend/routers/analysis.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List
import httpx 
import traceback
# auth.py에서 get_current_user 함수 가져오기
from routers.auth import get_current_user 
import crud, schemas, dbmodels, database
from database import get_db
import zipfile
import os
import shutil

# --- AI 서버 설정 ---
AI_SERVER_URL = "http://34.168.7.102:5000/api/v1/screen"
# ------------------

router = APIRouter(
    tags=["analysis"]
)

@router.post("/", response_model=schemas.AnalysisJob)
async def create_analysis(
    files: List[UploadFile] = File(...),
    criteria: str = Form(...),
    job: str = Form(""),
    degree: str = Form(""),
    license: str = Form(""),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # 1) DB 저장
    db_job = crud.create_analysis_job(
        db, 
        owner_id=current_user.id,
        title=job,
        degree=degree,
        license=license,
        criteria=criteria
    )

    # 2) 파일 저장 & 압축 풀기
    upload_dir = f"static/resumes/{db_job.id}"
    os.makedirs(upload_dir, exist_ok=True)

    ai_files = []
    saved_filenames = []

    for f in files:
        file_content = await f.read()
        ai_files.append(('file', (f.filename, file_content, f.content_type)))

        zip_path = os.path.join(upload_dir, f.filename)
        with open(zip_path, "wb") as buffer:
            buffer.write(file_content)

        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(upload_dir)
                saved_filenames = [
                    name for name in zip_ref.namelist()
                    if not name.startswith('__') and not name.startswith('.')
                ]
        except:
            saved_filenames.append(f.filename)

    # 3) 프롬프트 생성
    combined_prompt = f"""
IMPORTANT REQUIREMENTS:
- Job Role: {job}
- Required Degree: {degree}
- Certification: {license}
- Criteria: {criteria}
"""

    data = {"job_description": combined_prompt}

    # 4) AI 서버 요청
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(AI_SERVER_URL, files=ai_files, data=data)

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"AI Error: {response.text}")

            ai_json = response.json()
            print("AI JSON 원본:", ai_json)

            # AI가 list 또는 dict(data/results)로 줄 수 있음 → 그대로 추출
            if isinstance(ai_json, list):
                ai_results = ai_json
            elif isinstance(ai_json, dict):
                ai_results = (
                    ai_json.get("data")
                    or ai_json.get("results")
                    or []
                )
            else:
                ai_results = []

            
            final_results = ai_results

            total_applicants_count = len(final_results)

            # 5) DB 저장 (AI JSON 그대로 사용!)
            for index, item in enumerate(final_results, 1):
                if not isinstance(item, dict):
                    continue

                # key 이름: AI가 주는 그대로 사용
                name = item.get("Name") or item.get("name") or "Unknown"
                job_role = item.get("Job Role") or item.get("Job Roles") or item.get("job_role")
                degree_val = item.get("Degree") or item.get("degree")
                certification_val = item.get("Certification") or item.get("certification")
                score_val = item.get("Score") or item.get("score") or 0
                keywords_val = item.get("Keywords") or item.get("keywords") or ""
                resume_val = item.get("Resume") or item.get("resume") or ""

                # 너무 길면 요약 (DB 오류 방지)
                safe_resume = resume_val[:5000]

                # 파일 매칭
                matched_filename = f"{name}.pdf"
                for local_file in saved_filenames:
                    if name.lower().replace(" ", "") in local_file.lower().replace(" ", ""):
                        matched_filename = local_file
                        break

                pdf_link = f"http://136.117.27.55:8000/{upload_dir}/{matched_filename}"

                db_applicant = dbmodels.Applicant(
                    job_id=db_job.id,
                    rank=index,
                    name=name,
                    score=score_val,          
                    job_role=job_role,
                    education=degree_val,
                    certification=certification_val,
                    resume_summary=safe_resume,
                    pdf_url=pdf_link,
                    keywords=keywords_val     
                )

                db.add(db_applicant)

            db_job.status = "COMPLETED"
            db_job.progress = 100
            db_job.total_count = total_applicants_count
            db.add(db_job)
            db.commit()
            db.refresh(db_job)
            return db_job

    except Exception as e:
        traceback.print_exc()
        db_job.status = "FAILED"
        db.add(db_job)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
