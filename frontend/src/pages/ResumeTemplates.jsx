import React from "react";
import Header from '../components/Header';

/**
 * 개별 템플릿 카드를 렌더링하는 컴포넌트
 */
function TemplateCard({ title }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center 
                    mx-auto w-[300px] md:w-[320px] lg:w-[370px]">
      {/* 이력서 이미지 placeholder */}
      <div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-gray-500">이력서 이미지</span>
      </div>
      
      {/* 카드 하단 (제목 + 다운로드 버튼) */}
      <div className="w-full flex justify-between items-center mt-6">
        <span className="text-lg font-medium text-gray-800">{title}</span>
        <button 
          className="px-4 py-2 bg-white text-[#1AC0A4] border border-[#1AC0A4] rounded-md text-sm font-medium hover:bg-[#1AC0A4]/10 transition-colors"
        >
          다운로드
        </button>
      </div>
    </div>
  );
}

/**
 * Resume Templates 페이지
 */
export default function ResumeTemplates() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="w-full max-w-6xl mx-auto pt-24 pb-12 px-8">
        {/* 페이지 타이틀 */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          템플릿 다운로드
        </h1>

        {/* 3. 템플릿 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          <TemplateCard title="Template A" />
          <TemplateCard title="Template B" />
          <TemplateCard title="Template C" />
        </div>
      </main>
    </div>
  );
}
