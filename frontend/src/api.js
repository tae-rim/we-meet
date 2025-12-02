import axios from 'axios';

// 백엔드 서버 주소 (마지막에 슬래시 주의)
const BACKEND_URL = "http://localhost:8000/api/analysis";
const apiClient = axios.create({
  baseURL: "http://136.117.27.55:8000", // FastAPI 서버
});

// ★ [추가] 요청을 보내기 전에 가로채서 토큰을 헤더에 심는 코드 (Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰을 꺼냅니다.
    const token = localStorage.getItem("access_token");
    
    // 토큰이 있으면 헤더에 'Bearer 토큰값' 형태로 붙입니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const predictAI = async (zipFile, criteria, job, degree, license, onProgress) => {
  const formData = new FormData();
  formData.append("files", zipFile);   // FastAPI에서 files로 받음
  formData.append("criteria", criteria);
  // ★ 중요: 사용자가 입력한 모든 정보를 다 담아서 보냅니다.
  formData.append("job", job || "");        
  formData.append("degree", degree || "");
  formData.append("license", license || "");

  const response = await apiClient.post("/api/analysis/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Upload.jsx에서 넘겨준 함수(setProgress)를 여기서 실행!
        if (onProgress) {
            // 99%까지만 보여주고, 100%는 응답이 왔을 때 찍도록 함 (UX 팁)
            onProgress(percentCompleted > 99 ? 99 : percentCompleted);
        }
      }
    },
  });

  return response.data;
};

// --- API 함수들 ---

// 1. 로그인 (가장 중요한 수정 부분)
export const loginUser = async (email, password) => {
  // ★ 중요: FastAPI OAuth2PasswordRequestForm은 'form-data'를 요구합니다.
  // JSON이 아닌 URLSearchParams를 사용해야 합니다.
  const formData = new URLSearchParams();
  formData.append('username', email); // 백엔드는 'username'이라는 필드명을 기다립니다 (값은 이메일)
  formData.append('password', password);

  const response = await apiClient.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  
  return response.data; // { access_token, token_type }
};

// 2. 회원가입
export const registerUser = async (email, username, password) => {
  // Pydantic 스키마(UserCreate)와 필드명이 정확히 일치해야 합니다.
  const response = await apiClient.post("/auth/register", {
    email: email,
    username: username,
    password: password,
  });
  return response.data;
};

// 4. 분석 결과 조회 등 나머지 함수는 그대로 유지
export const fetchAnalysisResults = async (jobId) => {
  const response = await apiClient.get(`api/analysis/${jobId}/applicants`);
  return response.data; 
};

export const fetchApplicantDetail = async (applicantId) => {
  const response = await apiClient.get(`api/analysis/applicants/${applicantId}`);
  return response.data;
};

export const fetchHistoryList = async () => {
  const response = await apiClient.get("/api/analysis/history/all");
  return response.data;
};