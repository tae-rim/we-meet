# DB 테이블 모델을 정의
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    """사용자 테이블 (로그인용)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # User가 생성한 AnalysisJob 목록
    analysis_jobs = relationship("AnalysisJob", back_populates="owner")

class AnalysisJob(Base):
    """분석 작업 테이블 (업로드 1건)"""
    __tablename__ = "analysis_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # ★ [추가] 검색 조건들을 저장할 컬럼들
    title = Column(String(255), nullable=True)      # 직무 (예: Software Engineer)
    degree = Column(String(255), nullable=True)     # 학위
    license = Column(String(255), nullable=True)    # 자격증
    criteria = Column(Text, nullable=True)
    total_count = Column(Integer, default=0)          # 상세 요건

    owner = relationship("User", back_populates="analysis_jobs")
    applicants = relationship("Applicant", back_populates="job")

class Applicant(Base):
    """지원자 테이블 (분석 결과)"""
    __tablename__ = "applicants"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("analysis_jobs.id")) # 어떤 분석 작업에 속했는지
    
    rank = Column(Integer, name="Rank") # JSON 키와 맞춤
    name = Column(String(255), name="Job Applicant Name")
    score = Column(Float, name="Score")
    job_role = Column(String(255), name="Job Roles")

    education = Column(String(255), name="Education", nullable=True)
    certification = Column(Text, name="Certification", nullable=True)

    keywords = Column(Text, nullable=True)

    resume_summary = Column(Text, name="Resume")
    # resume_original_path = Column(String(1024)) # 원본 파일 저장 경로 (S3 등)
    pdf_url = Column(String(500), nullable=True)

    job = relationship("AnalysisJob", back_populates="applicants")