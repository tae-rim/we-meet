# we-meet

### 서비스 접속 (배포 상태)
```bash
본 서비스는 GCP 환경에 배포되어 있습니다.
백엔드 서버가 GCP에서 실행 중일 때에만 웹사이트 접속이 가능합니다.
로컬 환경에서 서버를 실행하지 않아도, GCP 서버가 실행 중이면 외부 IP를 통해 접속할 수 있습니다. (http://136.117.27.55:3000)

참고: 아래의 실행 방법은 개발 초기에 팀원끼리 코드 공유하면서 개발/로컬 테스트하는 목적이며, 현재 실제 서비스는 GCP 서버에서 동작합니다.
```

### 원하는 폴더 위치에서
```bash
git clone https://github.com/tae-rim/we-meet.git
```

### Frontend
```bash
cd we-meet/frontend
npm install
npm start
```
http://localhost:3000에서 실행됩니다.

### Backend
```bash
cd we-meet/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 환경변수 설정
```bash
cd backend
python -m venv venv
venv\Scripts\Activate
```
