import React from "react";
import Header from '../components/Header';

// 1. 이력서 파일 Import
import resume01 from '../assets/data/RESUME01.hwpx';
import resume02 from '../assets/data/RESUME02.hwpx';
import resume03 from '../assets/data/RESUME03.docx';

// 2. 이미지 파일 Import (확장자가 .png가 아니라면 .jpg 등으로 변경해주세요)
// 경로: src/assets/images/ 안에 파일이 있어야 합니다.
import resumeImg01 from '../assets/images/resume_preview01.png';
import resumeImg02 from '../assets/images/resume_preview02.png';
import resumeImg03 from '../assets/images/resume_preview03.png';

/**
 * 개별 템플릿 카드를 렌더링하는 컴포넌트
 * imgUrl: 템플릿 미리보기 이미지 경로
 */
function TemplateCard({ title, fileUrl, fileName, imgUrl }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center 
                    mx-auto w-[300px] md:w-[320px] lg:w-[370px]
                    hover:border-[#1AC0A4] hover:shadow-xl transition-all duration-300">
      
      {/* 3. 이력서 이미지 영역 (수정됨) */}
      {/* 이미지가 꽉 차게 보이려면 object-cover, 비율 유지하며 다 보이려면 object-contain */}
      <div className="w-full h-96 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-100">
        <img 
          src={imgUrl} 
          alt={`${title} Preview`} 
          className="w-full h-full object-contain" // object-contain: 비율 유지하며 박스 안에 맞춤
        />
      </div>
      
      {/* 카드 하단 (제목 + 다운로드 버튼) */}
      <div className="w-full flex justify-between items-center mt-6">
        <span className="text-lg font-medium text-gray-800">{title}</span>
        
        <a 
          href={fileUrl} 
          download={fileName} 
          className="no-underline"
        >
          <button 
            className="px-4 py-2 bg-white text-[#1AC0A4] border border-[#1AC0A4] rounded-md text-sm font-medium hover:bg-[#1AC0A4]/10 transition-colors cursor-pointer"
          >
            다운로드
          </button>
        </a>
      </div>
    </div>
  );
}

/**
 * Resume Templates 페이지
 */
export default function ResumeTemplates({ isLoggedIn, currentUser, onLogout }) {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        onLogout={onLogout} 
      />

      <main className="w-full max-w-6xl mx-auto pt-24 pb-12 px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          템플릿 다운로드
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          {/* 4. imgUrl prop 추가하여 이미지 전달 */}
          <TemplateCard 
            title="Template 01 : 한국어  hwpx " 
            fileUrl={resume01} 
            fileName="RESUME01.hwpx" 
            imgUrl={resumeImg01}
          />
          <TemplateCard 
            title="Template 02 : 영어  hwpx " 
            fileUrl={resume02} 
            fileName="RESUME02.hwpx" 
            imgUrl={resumeImg02}
          />
          <TemplateCard 
            title="Template 03 : 영어  docx " 
            fileUrl={resume03} 
            fileName="RESUME03.docx" 
            imgUrl={resumeImg03}
          />
        </div>
      </main>
    </div>
  );
}