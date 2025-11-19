# DB 연결을 관리
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- MySQL 연결 설정 ---
# "mysql+mysqlclient://[사용자명]:[패스워드]@[DB호스트]:[포트]/[DB이름]"
# 예: "mysql+mysqlclient://root:password@127.0.0.1:3306/fiture_db"
DATABASE_URL = "mysql+pymysql://root:1234@127.0.0.1:3306/fiture_db"
# --- ---

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI의 Depends에서 사용할 DB 세션 획득 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()