// src/pages/Dashboard1.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard2 from './Dashboard2';

/**
 * isAnalyzing 상태에 따라 다른 컨텐츠를 보여주는 컴포넌트
 */
export default function Dashboard1({ isAnalyzing, progress, isLoggedIn, currentUser, onLogout }) {
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    if (isAnalyzing && progress >= 100) {
      // 자동으로 Dashboard2 보여줌
    } else {
      setLocalProgress(progress);
    }
  }, [progress, isAnalyzing]);

  if (progress >= 100) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col">
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          onLogout={onLogout} 
        />
        <Sidebar />
        <main className="pl-64 pt-20 p-8">
          <Dashboard2 />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        onLogout={onLogout} 
      />
      <Sidebar />
      <main className="pl-64 pt-20 p-8 flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)]">
        {!isAnalyzing ? (
          <>
            <p className="text-2xl font-medium text-gray-500">
              분석을 시작해주세요
            </p>
            <p className="text-gray-400">
              Upload 페이지에서 '분석 시작하기'를 눌러주세요
            </p>
          </>
        ) : (
          <>
            <p className="text-xl text-gray-700 mb-4">
              분석이 끝나면 결과가 자동으로 로드됩니다
            </p>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-[#1AC0A4] h-3 rounded-full transition-all"
                style={{ width: `${localProgress}%` }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-[#1AC0A4]">{localProgress}%</p>
          </>
        )}
      </main>
    </div>
  );
}