# FastAPI 실행. 모든 것 하나로 합치기.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# 1. PDF를 저장할 실제 폴더 생성 (없으면 생성)
UPLOAD_DIR = "static/pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 2. '/pdfs' 주소로 요청이 오면 'static/pdfs' 폴더의 파일을 보여줌
# 예: http://localhost:8000/pdfs/이력서.pdf
app.mount("/pdfs", StaticFiles(directory=UPLOAD_DIR), name="pdfs")

# --- ---

# API 라우터 포함
# --- 라우터 등록 ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analysis.router, prefix="/api/analysis") # /api/analysis 포함
# (참고) /api/templates 라우터도 만들어서 여기에 포함시키세요

@app.get("/")
def read_root():
    return {"Hello": "World"}
