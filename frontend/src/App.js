import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 페이지들 import
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import Dashboard1 from "./pages/Dashboard1";
import Upload from "./pages/Upload";
import ResumeTemplates from "./pages/ResumeTemplates";
import Dashboard2 from "./pages/Dashboard2";
import Dashboard3 from './pages/Dashboard3';
import RegisterPage from './pages/RegisterPage';
import Header from "./components/Header";


import "./styles/globals.css";
import "./styles/Dashboard2.css";
import "./styles/Dashboard3.css";
import "./styles/Dashboard4.css";

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태 추가

  // ★ 앱 실행 시 로컬 스토리지에서 토큰 확인 (로그인 유지)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_info");

    if (token) {
      setIsLoggedIn(true);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        setCurrentUser({ username: "User" }); // 기본값
      }
    }
    setIsLoading(false); // 확인 끝
  }, []);

  const handleLogin = (userData, token) => {
    // 로그인 성공 시 토큰과 유저 정보 저장
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_info", JSON.stringify(userData));
    
    setIsLoggedIn(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    // 로그아웃 시 스토리지 비우기
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = (files) => {
    if (files.length === 0) return false;
    setIsAnalyzing(true);
    return true;
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
  };

  // 초기 토큰 확인 중이면 빈 화면(혹은 로딩바) 보여주기
  if (isLoading) return null; 

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />

        {/* 회원가입 */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 로그인: onLogin 함수 형태 변경에 주의 */}
        <Route 
          path="/login" 
          element={
            isLoggedIn 
              ? <Navigate to="/main" /> 
              : <LoginPage onLogin={(user, token) => handleLogin(user, token)} />
          } 
        />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage isLoggedIn={isLoggedIn} 
              currentUser={currentUser} 
              onLogout={handleLogout}/>} />

        {/* Protected Routes (로그인 필요한 페이지들) */}
        <Route 
          path="/upload" 
          element={
            isLoggedIn 
              ? <Upload 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  onLogout={handleLogout}
                  isAnalyzing={isAnalyzing} 
                  setIsAnalyzing={setIsAnalyzing} 
                  setProgress={setProgress}
                  onAnalysisStart={handleAnalysisStart}
                /> 
              : <Navigate to="/login" />
          } 
        />
        
        <Route
          path="/dashboard1"
          element={
            isLoggedIn 
              ? <Dashboard1 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  onLogout={handleLogout}
                  isAnalyzing={isAnalyzing} 
                  progress={progress} 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              : <Navigate to="/login" />
          }
        />
        
        <Route 
          path="/dashboard2" 
          element={
            isLoggedIn 
              ? <Dashboard2 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                /> 
              : <Navigate to="/login" />
          } 
        /> 
        
        <Route 
          path="/dashboard3/:id" 
          element={
            isLoggedIn 
              ? <Dashboard3 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                /> 
              : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/resume" 
          element={
            isLoggedIn 
              ? <ResumeTemplates isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}