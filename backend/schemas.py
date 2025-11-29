# Pydantic을 사용해 API가 받을 요청(Request)과 보낼 응답(Response)의 형식을 검증
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# --- Token 관련 스키마 ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- User 관련 스키마 (구조 개선) ---
class UserBase(BaseModel):
    email: str
    username: str  # ★ 중요: 프론트에서 보낸 username을 여기서 받아야 함

class UserLogin(BaseModel):
    email: str
    password: str

# 회원가입 시 받는 데이터 (Base + password)
class UserCreate(BaseModel):
    email: str
    username: str  # ★ 프론트와 일치
    password: str

# 응답으로 내보내는 데이터 (Base + id + is_active)
class User(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)

# --- 프론트엔드 JSON 구조와 일치시키는 Schema ---
class ApplicantResponse(BaseModel):
    id: int
    # Field(..., alias="...")를 사용하여 DB 컬럼명(소문자)을 
    # 프론트엔드용 이름(대문자/공백포함)으로 변환하여 내보냅니다.
    Rank: int = Field(..., alias="rank")
    Job_Applicant_Name: str = Field(..., alias="name")
    Score: float = Field(..., alias="score")
    Job_Roles: str = Field(..., alias="job_role")
    Education: Optional[str] = Field(None, alias="education")
    Certification: Optional[str] = Field(None, alias="certification")

    Resume: str = Field(..., alias="resume_summary")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class AnalysisJob(BaseModel):
    id: int
    status: str
    progress: int
    # applicants: List[ApplicantResponse] = [] # 리스트 포함 시

    model_config = ConfigDict(from_attributes=True)


class Applicant(BaseModel):
    id: int
    rank: Optional[int] = None
    name: Optional[str] = None
    score: Optional[float] = None
    job_role: Optional[str] = None
    
    education: Optional[str] = None      
    certification: Optional[str] = None  
    
    resume_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)