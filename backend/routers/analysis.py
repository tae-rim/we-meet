# backend/routers/analysis.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import httpx 
import traceback
# auth.py에서 get_current_user 함수 가져오기
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
    job: str = Form(""),       # 사용자 입력: "Software Engineer"
    degree: str = Form(""),    # 사용자 입력: "Master"
    license: str = Form(""),   # 사용자 입력: "AWS..."
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user) # 로그인 유저
):
    # 1. DB 저장 (기록용)
    # ★ 수정 1: 변수명을 'db_job'으로 분리 (변수명 충돌 방지)
    db_job = crud.create_analysis_job(
        db, 
        owner_id=current_user.id, 
        title=job,     
        degree=degree,
        license=license,
        criteria=criteria
    ) 

    # 2. 파일 준비
    ai_files = []
    for f in files:
        file_content = await f.read()
        ai_files.append(('file', (f.filename, file_content, f.content_type)))
    
    # 3. [핵심] 프롬프트 생성 (변수 직접 사용!)
    # ★ 수정 2: db_job.title 대신 입력받은 'job' 문자열을 바로 사용
    combined_prompt = (
        f"IMPORTANT REQUIREMENTS:\n"
        f"1. Must match Job Role: {job} {job} {job}\n"  # 3번 강조
        f"2. Required Degree: {degree}\n"
        f"3. Preferred Certification: {license}\n"
        f"4. Detailed Criteria: {criteria}"
    )

    data = {'job_description': combined_prompt}
    
    # 디버깅 로그
    print("\n" + "="*50)
    print(f"🎯 [AI 입력 확인] 직무: {job}, 학위: {degree}, 자격증: {license}")
    print(f"📝 [생성된 프롬프트]:\n{combined_prompt}")
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
                
                # ---------------------------------------------------------
                # ★ 수정 3: [강력 필터링] 직무가 선택되었다면, 다른 직무는 제거
                # ---------------------------------------------------------
                if job and job.strip() != "":
                    print(f"⚔️ 필터링 시작: '{job}' 가 포함된 지원자만 남깁니다.")
                    filtered_list = []
                    target_job_clean = job.lower().replace(" ", "") 
                    
                    for item in final_results:
                        if not isinstance(item, dict): continue
                        
                        candidate_role = item.get('Job Roles', '') or item.get('Job Role', '')
                        candidate_role_clean = candidate_role.lower().replace(" ", "")
                        
                        # 포함 여부 확인
                        if target_job_clean in candidate_role_clean:
                            filtered_list.append(item)
                    
                    final_results = filtered_list
                    print(f"✅ 필터링 완료: {len(final_results)}명 남음")
                # ---------------------------------------------------------

                # 4. DB 저장 (여기서 순위를 다시 매깁니다!)
                # enumerate(final_results, 1) -> 1번부터 번호를 새로 붙입니다.
                for index, item in enumerate(final_results, 1):
                    if not isinstance(item, dict): continue

                    # 요약문 생성 (그대로 유지)
                    raw_resume = item.get('Resume') or item.get('resume')
                    if not raw_resume:
                        skill1 = item.get('Skill_1', '')
                        skill2 = item.get('Skill_2', '')
                        skills_text = f"Skills: {skill1}, {skill2}" if (skill1 or skill2) else ""
                        raw_resume = (
                            f"Applicant for {item.get('Job Roles', 'Unknown Position')}.\n"
                            f"{skills_text}\n"
                            f"Education: {item.get('Degree', 'N/A')}"
                        )

                    applicant = dbmodels.Applicant(
                        job_id=db_job.id,
                        
                        # ★ [핵심 수정] AI가 준 'Rank' 대신, 우리가 센 순서(index)를 넣습니다.
                        rank=index,  
                        
                        name=item.get('Name') or item.get('name'),
                        score=(item.get('Score') or item.get('score') or 0) * 100,
                        job_role=item.get('Job Roles') or item.get('job_role'),
                        education=item.get('Degree') or item.get('degree'),
                        certification=item.get('Certification') or item.get('certification'),
                        resume_summary=raw_resume
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
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
    return stats

@router.get("/{id}/applicants", response_model=List[schemas.Applicant])
def get_applicants(id: int, db: Session = Depends(get_db)):
    applicants = crud.get_applicants(db, job_id=id)
    return applicants

@router.get("/applicants/{id}", response_model=schemas.Applicant)
def get_applicant_detail(id: int, db: Session = Depends(get_db)):
    applicant = crud.get_applicant_detail(db, applicant_id=id)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant

# 5. 사용자의 모든 분석 기록 조회 (History)
@router.get("/history/all", response_model=List[schemas.AnalysisJob])
def get_analysis_history(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # owner_id == current_user.id인 AnalysisJob들 조회
    jobs = db.query(dbmodels.AnalysisJob)\
             .filter(dbmodels.AnalysisJob.owner_id == current_user.id)\
             .order_by(dbmodels.AnalysisJob.created_at.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()
    return jobs