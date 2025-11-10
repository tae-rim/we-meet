import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 템플릿 파일 경로는 대소문자를 구분하므로 'Template.jsx'로 가정합니다.
import Template from "../components/Template";

export default function LoginPage() {
  const navigate = useNavigate(); // ← 컴포넌트 안에서 useNavigate 사용
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(`로그인 시도: ${email} / ${password}`);
    // 로그인 성공 시 메인 페이지로 이동
    navigate("/main");
  };

  return (
    <Template>
      {/* Template 컴포넌트가 <div className="min-h-screen bg-white"> ... </div>
        와 같이 흰색 배경을 제공한다고 가정합니다.
      */}
      
      {/* 1. 로고 (절대 위치) - 새 디자인 적용 */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        {/* 피그마 이미지 기반 로고 텍스트 */}
        <span className="text-xl font-bold tracking-tight text-gray-800">FITURE</span>
        {/* 새 디자인의 초록색 점 (새 색상 적용) */}
        <div className="w-2.5 h-2.5 bg-[#1AC0A4] rounded-full"></div>
      </div>

      {/* 2. Main content (중앙 정렬된 로그인 폼) */}
      <main className="w-full min-h-screen flex items-center justify-center">
        
        <div className="w-full max-w-md p-8"> 
          
          {/* LOGIN 타이틀 (새 색상 적용) */}
          <h1 className="text-3xl font-bold text-center text-[#1AC0A4] mb-8">
            LOGIN
          </h1>

          {/* 입력 폼 */}
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            
            {/* 아이디 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">아이디</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="address123@gmail.com"
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]" // 새 색상 적용
              />
            </div>

            {/* 패스워드 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">패스워드</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*********"
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]" // 새 색상 적용
              />
            </div>

            {/* 로그인 버튼 (새 색상 적용) */}
            <button
              type="submit"
              className="w-full h-12 mt-4 bg-[#1AC0A4] text-white font-medium rounded-md hover:bg-[#169a83] transition-colors" // 새 색상 및 hover 색상 적용
            >
              로그인
            </button>
          </form>

        </div>
      </main>
    </Template>
  );
}

