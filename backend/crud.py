# DB에서 데이터를 읽고, 쓰고, 수정하고, 지우는(CRUD) 함수
from sqlalchemy.orm import Session
import schemas, security, dbmodels

# 이메일로 유저 찾기 (로그인/가입 중복체크용)
def get_user_by_email(db: Session, email: str):
    return db.query(dbmodels.User).filter(dbmodels.User.email == email).first()

# 유저네임으로 찾기 (선택 사항)
def get_user_by_username(db: Session, username: str):
    return db.query(dbmodels.User).filter(dbmodels.User.username == username).first()

# 유저 생성 (회원가입)
def create_user(db: Session, user: schemas.UserCreate):
    # 1. 비밀번호 해싱
    hashed_password = security.get_password_hash(user.password)
    
    # 2. DB 모델 생성
    # schemas.UserCreate에 username이 추가되었으므로 user.username 접근 가능!
    db_user = dbmodels.User(
        email=user.email, 
        username=user.username, 
        hashed_password=hashed_password
    )
    
    # 3. 저장
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 분석 작업 생성
def create_analysis_job(db: Session, owner_id: int):
    db_job = dbmodels.AnalysisJob(owner_id=owner_id, status="PENDING")
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_analysis_stats(db: Session, job_id: int):
    # (예시) 통계 데이터 조회 로직 (추후 구현)
    return {"total": 100, "passed": 20, "avg_score": 85.0}

def get_applicants(db: Session, job_id: int, skip: int = 0, limit: int = 100):
    return db.query(dbmodels.Applicant).filter(dbmodels.Applicant.job_id == job_id).offset(skip).limit(limit).all()

def get_applicant_detail(db: Session, applicant_id: int):
    return db.query(dbmodels.Applicant).filter(dbmodels.Applicant.id == applicant_id).first()