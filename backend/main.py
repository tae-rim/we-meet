# FastAPI 실행. 모든 것 하나로 합치기.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routers import auth, analysis
import dbmodels
from database import engine


# DB에 테이블 생성
dbmodels.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS 설정 (중요 수정) ---
# React 앱(3000번)과 통신하기 위한 허용 목록
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://136.117.27.55:3000",
]

app.add_middleware(
    CORSMiddleware,
    # ★ 수정: ["*"] 대신 명시적인 origins 리스트 사용 (allow_credentials=True일 때 필수)
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. 파일 저장할 폴더 만들기
os.makedirs("static/resumes", exist_ok=True)
# 2. 정적 파일 경로 마운트 (이게 있어야 브라우저에서 접근 가능)
# 예: http://localhost:8000/static/resumes/15/홍길동.pdf 로 접속 가능해짐
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- ---

# API 라우터 포함
# --- 라우터 등록 ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analysis.router, prefix="/api/analysis") # /api/analysis 포함
# (참고) /api/templates 라우터도 만들어서 여기에 포함시키세요

@app.get("/")
def read_root():
    return {"Hello": "World"}