# 분석/대시보드 API. /api/analysis
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import httpx # AI 서버와 통신하기 위함

import crud, schemas, dbmodels, database

from database import get_db
# (참고) from ..security import get_current_user # 토큰으로 현재 유저 가져오기

# --- AI 서버 설정 ---
AI_SERVER_URL = "http://136.117.180.115:5000/analyze"
# --- ---

router = APIRouter(
    tags=["analysis"]
)

@router.post("/api/analysis", response_model=schemas.AnalysisJob)
async def create_analysis(
    files: List[UploadFile] = File(...), 
    db: Session = Depends(get_db)
    # current_user: schemas.User = Depends(get_current_user) # 로그인 유저
):
    # 1. DB에 AnalysisJob 생성 (소유자 ID와 함께)
    # job = crud.create_analysis_job(db, owner_id=current_user.id)
    job = crud.create_analysis_job(db, owner_id=1) # (임시로 1번 유저)
    
    # 2. (비동기) 파일들을 AI 서버로 전송
    # (실제로는 Celery/RabbitMQ 같은 백그라운드 작업으로 처리해야 함)
    
    ai_files = []
    for file in files:
        ai_files.append(('files', (file.filename, file.file.read(), file.content_type)))
        
    try:
        async with httpx.AsyncClient(timeout=300.0) as client: # 5분 타임아웃
            # AI 서버에 요청
            response = await client.post(AI_SERVER_URL, files=ai_files)
            
            if response.status_code == 200:
                # 3. AI 결과(JSON)를 받음
                results_json = response.json() # ranked_results.json과 동일한 형식
                
                # 4. 결과를 DB에 저장
                for item in results_json:
                    applicant = dbmodels.Applicant(
                        job_id=job.id,
                        Rank=item['Rank'],
                        Name=item['Job Applicant Name'],        # 여기 키가 바뀌면 바꿔야 함
                        Score=item['Score'],
                        Job_Role=item['Job Roles'],             # 여기 키도 바뀌면 바꿔야 함
                        Education=item['Education'],           # 새로 추가됨
                        Certification=item['Certification'],   # 새로 추가됨
                        Resume_Summary=item['Resume']
                    )
                    db.add(applicant)
                
                # 5. 작업 상태 "COMPLETED"로 업데이트
                job.status = "COMPLETED"
                job.progress = 100
                db.add(job)
                db.commit()
                db.refresh(job)
                return job
            else:
                raise HTTPException(status_code=500, detail="AI server error")
                
    except Exception as e:
        job.status = "FAILED"
        db.add(job)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/api/analysis/{id}/stats")
def get_stats(id: int, db: Session = Depends(get_db)):
    stats = crud.get_analysis_stats(db, job_id=id)
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
    return stats

@router.get("/api/analysis/{id}/applicants", response_model=List[schemas.Applicant])
def get_applicants(id: int, db: Session = Depends(get_db)):
    applicants = crud.get_applicants(db, job_id=id)
    return applicants

@router.get("/api/applicants/{id}", response_model=schemas.Applicant)
def get_applicant_detail(id: int, db: Session = Depends(get_db)):
    applicant = crud.get_applicant_detail(db, applicant_id=id)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant