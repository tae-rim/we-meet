import React, { useState } from "react"; // <-- useState 임포트
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// 페이지들 import
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import Dashboard1 from "./pages/Dashboard1"; // <-- Dashboard1 임포트
import Upload from "./pages/Upload";
import ResumeTemplates from "./pages/ResumeTemplates";
import Dashboard2 from "./pages/Dashboard2";
import Dashboard3 from './pages/Dashboard3';


// 글로벌 스타일
import "./styles/globals.css";
// import "./styles/variables.css"; // globals.css로 합쳤거나 사용하지 않는다면 주석 처리

import "./styles/Dashboard2.css";
import "./styles/Dashboard3.css";
import "./styles/Dashboard4.css";

export default function App() {
  
  // '분석 중' 상태를 App.js (최상위)로 끌어올림
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <Router>
      <Routes>
        {/* 기본 진입 시 로그인 페이지로 이동 */}
        <Route path="/" element={<Navigate to="/main" />} />

        {/* 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* Upload 페이지에 setIsAnalyzing와 setProgress 전달 */}
        <Route 
          path="/upload" 
          element={<Upload isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} setProgress={setProgress} />} 
        />
        <Route
          path="/dashboard1"
          element={<Dashboard1 isAnalyzing={isAnalyzing} progress={progress} />}
        />
        <Route path="/dashboard2" element={<Dashboard2 />} />        

        <Route path="/dashboard3/:id" element={<Dashboard3 />} />

        {/* Resume Templates 페이지 */}
        <Route path="/resume" element={<ResumeTemplates />} />

        {/* 잘못된 경로 접근 시 기본 페이지로 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}