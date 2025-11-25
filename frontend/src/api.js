import axios from 'axios';

// 백엔드 서버 주소 (마지막에 슬래시 주의)
const API_BASE_URL = "http://136.118.83.87:8000/api";

const AI_BASE_URL = "http://136.117.180.115:5000";

export const predictAI = async (text) => {
  const response = await axios.post(`${AI_BASE_URL}/predict`, { text });
  return response.data; // { result: ... }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// 3. 파일 업로드
export const uploadFiles = async (files) => {
  const formData = new FormData();
  // files가 배열인지 확인 후 처리
  if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("files", file);
      });
  } else {
      formData.append("files", files);
  }
  
  const response = await apiClient.post("/analysis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 4. 분석 결과 조회 등 나머지 함수는 그대로 유지
export const fetchAnalysisResults = async (jobId) => {
  const response = await apiClient.get(`/analysis/${jobId}/applicants`);
  return response.data; 
};

export const fetchApplicantDetail = async (applicantId) => {
  const response = await apiClient.get(`/applicants/${applicantId}`);
  return response.data;
};

export default apiClient;