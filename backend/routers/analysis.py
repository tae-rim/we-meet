# backend/routers/analysis.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import httpx 
import traceback
import zipfile
import os
import shutil
from routers.auth import get_current_user 
import crud, schemas, dbmodels, database
from database import get_db

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
    # 1. DB 저장
    db_job = crud.create_analysis_job(
        db, 
        owner_id=current_user.id, 
        title=job,     
        degree=degree,
        license=license,
        criteria=criteria
    ) 

    # 2. 파일 저장 및 압축 해제 준비
    upload_dir = f"static/resumes/{db_job.id}"
    os.makedirs(upload_dir, exist_ok=True)

    ai_files = []
    
    for f in files:
        # 1) 파일 읽기
        file_content = await f.read()
        ai_files.append(('file', (f.filename, file_content, f.content_type)))
        
        # 2) ZIP 파일 저장
        zip_path = os.path.join(upload_dir, f.filename)
        with open(zip_path, "wb") as buffer:
            buffer.write(file_content)
            
        # 3) 압축 풀기
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(upload_dir)
            print(f"✅ 압축 해제 완료: {upload_dir}")
        except Exception as e:
            print(f"⚠️ 압축 해제 실패 (PDF 아닐 수 있음): {e}")

    
    # 3. 프롬프트 생성
    combined_prompt = (
        f"IMPORTANT REQUIREMENTS:\n"
        f"1. Must match Job Role: {job} {job} {job}\n" 
        f"2. Required Degree: {degree}\n"
        f"3. Preferred Certification: {license}\n"
        f"4. Detailed Criteria: {criteria}"
    )

    data = {'job_description': combined_prompt}
    
    print("\n" + "="*50)
    print(f"🎯 [AI 입력 확인] 직무: {job}, 학위: {degree}, 자격증: {license}")
    print("="*50 + "\n")

    try:
        print(f"DEBUG: AI 서버({AI_SERVER_URL})로 전송 시도...")
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(AI_SERVER_URL, files=ai_files, data=data)
            
            if response.status_code == 200:
                print("DEBUG: AI 분석 성공!")
                results_json = response.json()
                
                final_results = []
                if isinstance(results_json, dict):
                    if 'data' in results_json: final_results = results_json['data']
                    elif 'results' in results_json: final_results = results_json['results']
                elif isinstance(results_json, list):
                    final_results = results_json
                
                # [강력 필터링]
                if job and job.strip() != "":
                    filtered_list = []
                    target_job_clean = job.lower().replace(" ", "") 
                    for item in final_results:
                        if not isinstance(item, dict): continue
                        candidate_role = item.get('Job Roles', '') or item.get('Job Role', '')
                        if target_job_clean in candidate_role.lower().replace(" ", ""):
                            filtered_list.append(item)
                    final_results = filtered_list
                    print(f"✅ 필터링 완료: {len(final_results)}명 남음")

                # 4. DB 저장
                for index, item in enumerate(final_results, 1):
                    if not isinstance(item, dict): continue

                    safe_resume = raw_resume[:5000] if raw_resume else ""

                    file_name = item.get('File_Name') or f"{item.get('Name')}.pdf"
                    
                    # ★ 실제 배포된 VM IP로 설정 (8000번 포트)
                    server_url = "http://136.117.27.55:8000" 
                    pdf_link = f"{server_url}/static/resumes/{db_job.id}/{file_name}"

                    applicant = dbmodels.Applicant(
                        job_id=db_job.id,
                        rank=index,
                        name=item.get('Name') or item.get('name'),
                        score=(item.get('Score') or item.get('score') or 0) * 100,
                        job_role=item.get('Job Roles') or item.get('job_role'),
                        education=item.get('Degree') or item.get('degree'),
                        certification=item.get('Certification') or item.get('certification'),
                        resume_summary=safe_resume, 
                        pdf_url=pdf_link           
                    )
                    db.add(applicant)
                
                db_job.status = "COMPLETED"
                db_job.progress = 100
                db.add(db_job)
                db.commit()
                db.refresh(db_job)
                return db_job
            
            else:
                error_msg = response.text
                print(f"🚨 AI 서버 거절: {error_msg}")
                raise HTTPException(status_code=500, detail=f"AI Error: {error_msg}")
                
    except Exception as e:
        print("=== 🚨 시스템 에러 발생 ===")
        traceback.print_exc()
        db_job.status = "FAILED"
        db.add(db_job)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}/stats")
def get_stats(id: int, db: Session = Depends(get_db)):
    stats = crud.get_analysis_stats(db, job_id=id)
    if not stats: raise HTTPException(status_code=404, detail="Stats not found")
    return stats

@router.get("/{id}/applicants", response_model=List[schemas.Applicant])
def get_applicants(id: int, db: Session = Depends(get_db)):
    applicants = crud.get_applicants(db, job_id=id)
    return applicants

@router.get("/applicants/{id}", response_model=schemas.Applicant)
def get_applicant_detail(id: int, db: Session = Depends(get_db)):
    applicant = crud.get_applicant_detail(db, applicant_id=id)
    if not applicant: raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant

@router.get("/history/all", response_model=List[schemas.AnalysisJob])
def get_analysis_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    jobs = db.query(dbmodels.AnalysisJob).filter(dbmodels.AnalysisJob.owner_id == current_user.id).order_by(dbmodels.AnalysisJob.created_at.desc()).offset(skip).limit(limit).all()
    return jobs
