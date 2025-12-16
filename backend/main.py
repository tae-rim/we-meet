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

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    # 명시적인 origins 리스트 사용 (allow_credentials=True일 때 필수)
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. 라우터 등록 ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analysis.router, prefix="/api/analysis")


@app.get("/")
def read_root():
    return {"Hello": "World"}
