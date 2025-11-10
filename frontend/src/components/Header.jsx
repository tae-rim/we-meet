// src/components/Header.jsx
// 각 대시보드에서 고정된 부분.
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-8">

    {/* 왼쪽: 로고 + 네비게이션 */}
    <div className="flex items-center gap-20">
      {/* 로고 */}
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => navigate("/main")}
      >
        <span className="text-xl font-bold text-gray-800">FITURE</span>
        <div className="w-2.5 h-2.5 bg-[#1AC0A4] rounded-full"></div>
      </div>

      {/* 네비게이션 링크 */}
      <nav className="flex gap-8">
        <span
          onClick={() => navigate("/upload")}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          upload
        </span>
        <span
          onClick={() => navigate("/dashboard1")}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          dashboard
        </span>
        <span
          onClick={() => navigate("/resume")}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          resume templates
        </span>
      </nav>
    </div>

    {/* 오른쪽: 로그인 버튼 */}
    <div className="flex items-center gap-2">    
      <button
        onClick={() => navigate("/login")}
        className="px-5 py-2 bg-transparent border-2 border-[#1AC0A4] text-[#1AC0A4] font-medium rounded-md hover:bg-[#1AC0A4] hover:text-white transition-colors"
      >
        Sign in
      </button>
    </div>
  </div>
</header>
  );
}


