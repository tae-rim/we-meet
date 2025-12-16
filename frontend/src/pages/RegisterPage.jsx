import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Template from "../components/Template"; 
import { registerUser } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // 입력값 상태
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 에러 메시지 상태
  const [error, setError] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. 간단한 유효성 검사
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    try {
      // 2. 회원가입 API 호출
      await registerUser(email, username, password);
      
      // 3. 성공 시 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
      
    } catch (err) {
      console.error("회원가입 에러:", err);
      // 백엔드에서 보내주는 에러 메시지가 있다면 표시 (예: "Email already registered")
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 로고 */}
      <div 
        className="absolute top-8 left-8 flex items-center gap-1 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="text-xl font-bold text-gray-800">FITURE</span>
        <div className="w-2.5 h-2.5 bg-[#1AC0A4] rounded-full"></div>
      </div>

      <main className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          
          <h1 className="text-3xl font-bold text-center text-[#1AC0A4] mb-8">
            SIGN UP
          </h1>

          <form className="flex flex-col gap-5" onSubmit={handleRegisterSubmit}>
            
            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]"
              />
            </div>

            {/* 이름(닉네임) */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">이름</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="홍길동"
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]"
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4]"
              />
            </div>

            {/* 에러 메시지 */}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full h-12 mt-4 bg-[#1AC0A4] text-white font-medium rounded-md hover:bg-[#169a83] transition-colors"
            >
              회원가입
            </button>
          </form>

          {/* 로그인 페이지로 이동 */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              이미 계정이 있으신가요?{" "}
              <span 
                onClick={() => navigate("/login")}
                className="text-[#1AC0A4] font-medium cursor-pointer hover:underline"
              >
                로그인하기
              </span>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}