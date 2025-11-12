import React from 'react';
import { useParams } from 'react-router-dom';
// VS Code 환경을 기준으로, 표준 React 컴포넌트 경로(대문자)로 수정합니다.
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

import mockData from '../ranked_results.json'; 

/**
 * 지원자 상세 정보 페이지
 */
export default function Dashboard3({ isLoggedIn, currentUser, onLogout }) {
  
  // 1. URL에서 :id 값을 가져옴
  const { id } = useParams();
  
  // 2. mockData에서 id와 일치하는 지원자 찾기
  const applicant = mockData.find(a => a.Rank.toString() === id);

  // 3. 지원자 정보가 없을 경우 (예: 잘못된 URL)
  if (!applicant) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col">
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          onLogout={onLogout} 
        />
        <div className="flex flex-1 pt-20">
          <Sidebar />
          <main className="flex-1 ml-64 p-12 bg-gray-50 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-500">지원자 정보를 찾을 수 없습니다.</h1>
          </main>
        </div>
      </div>
    );
  }

  // 4. 지원자 정보가 있을 경우 (정상 화면)
  const jobTagClass = applicant["Job Roles"].includes('Back-End')
    ? 'bg-orange-100 text-orange-600'
    : 'bg-green-100 text-green-600';

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* 1. 고정 헤더 */}
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        onLogout={onLogout} 
      />
      
      <div className="flex flex-1 pt-20"> {/* Header 높이(80px)만큼 pt */}
        {/* 2. 고정 사이드바 */}
        <Sidebar />
        
        {/* 3. 메인 컨텐츠 영역 (스크롤) */}
        <main className="flex-1 ml-64 p-12 bg-gray-50 grid grid-cols-3 gap-8">
          
          {/* 3-1. 왼쪽: 지원자 정보 */}
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* ★ 수정: 'name' -> 'Job Applicant Name', 'job' -> 'Job Roles' */}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{applicant["Job Applicant Name"]}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${jobTagClass}`}>
                {applicant["Job Roles"]}
              </span>
            </div>

            {/* ★ 수정: 정보 카드를 ranked_results.json의 데이터로 변경 */}
            {/* 'score' -> 'Score', 소수점 2자리까지 표시 */}
            <InfoCard title="종합점수" value={applicant.Score.toFixed(2)} /> 
            
            {/* 'strength', 'weakness', 'experience' 대신 'Resume' 요약 표시 */}
            <InfoCardLong title="이력서 요약" text={applicant.Resume} />

          </div>

          {/* 3-2. 오른쪽: 이력서 원본 */}
          <div className="col-span-2 bg-gray-200 rounded-lg flex items-center justify-center min-h-[calc(100vh-160px)]">
            {/* 나중에 실제 이력서 PDF/이미지를 렌더링할 컴포넌트가 
              여기에 들어갑니다. (예: <iframe src={applicant.resumeUrl} />)
            */}
            <span className="text-gray-500 font-medium">이력서 원본 (PDF 뷰어 영역)</span>
          </div>

        </main>
      </div>
    </div>
  );
}

// 정보 카드 컴포넌트 (짧은 텍스트용)
const InfoCard = ({ title, value }) => (
  <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

// ★ 신규: 정보 카드 컴포넌트 (긴 텍스트용)
const InfoCardLong = ({ title, text }) => (
  <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-base text-gray-800 mt-3 leading-relaxed">{text}</p>
  </div>
);

