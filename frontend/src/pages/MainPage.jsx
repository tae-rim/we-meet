import React from "react";
// Header 컴포넌트 import 경로를 소문자 'h' (header.jsx)로 수정합니다.
import Header from "../components/Header";

// 첫 번째 섹션 (Hero)
const HeroSection = () => {
  return (
    <section className="h-screen w-full flex items-center justify-center pt-20"> {/* pt-20은 헤더 높이만큼 */}
      <div className="container mx-auto flex items-center justify-between px-8">
        {/* 왼쪽 텍스트 */}
        <div className="flex flex-col gap-6 max-w-lg">
          <h1 className="text-4xl font-bold text-gray-800 leading-tight">
            복잡한 채용 과정을<br />
            더 쉽게, 더 빠르게
          </h1>
          <p className="text-xl text-gray-600">
            간단한 프로세스로 수많은 이력서를 한번에<br />
            기업이 원하는 직관적인 ATS
          </p>
        </div>

        {/* 오른쪽 장식용 박스 */}
        <div className="relative w-96 h-96">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#C8EFE3]/50"></div>
          <div className="absolute top-8 left-8 w-80 h-80 bg-[#C8EFE3]/50"></div>
          <div className="absolute top-16 left-16 w-80 h-80 bg-[#C8EFE3]/50"></div>
        </div>
      </div>
    </section>
  );
};

// 두 번째 섹션 (통계)
const StatsSection = () => {
  const applicants = [
    { rank: 1, name: "김OO", score: 97, role: "Back-End" },
    { rank: 2, name: "박OO", score: 96, role: "Front-End" },
    { rank: 3, name: "이OO", score: 96, role: "Back-End" },
    { rank: 4, name: "최OO", score: 96, role: "Back-End" },
    { rank: 5, name: "강OO", score: 95, role: "Front-End" },
  ];

  const chartData = [
    { month: "JAN", value: 480 },
    { month: "FEB", value: 720 },
    { month: "MAR", value: 630 },
    { month: "APR", value: 630 },
    { month: "MAY", value: 510 },
    { month: "JUN", value: 830 },
    { month: "JUL", value: 890 },
    { month: "AUG", value: 450 },
    { month: "SEP", value: 850 },
    { month: "OCT", value: 760 },
    { month: "NOV", value: 960 },
    { month: "DEC", value: 1020 }, 
  ];

  return (
    <section className="h-screen w-full flex items-center justify-center bg-gray-50 py-20">
      <div className="container mx-auto flex flex-col items-center gap-12 px-8">
        {/* 섹션 타이틀 */}
        <div className="text-center">
          <p className="text-lg text-gray-500">통계지표부터 지원자 비교까지</p>
          <h2 className="text-5xl font-bold text-gray-800 mt-2">한눈에 보이는 결과</h2>
        </div>

        {/* 컨텐츠 (차트 + 랭킹) */}
        <div className="w-full max-w-6xl flex gap-8">
          {/* 1. 막대 차트 (CSS로 구현) - Fix 3: Y축 추가 */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">CHART TEXT</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#79D7BE] rounded-sm"></div>
                <span className="text-sm text-gray-500">LOREM</span>
              </div>
            </div>
            {/* Y축 + 차트 */}
            <div className="w-full h-[300px] flex">
              {/* Y축 레이블 */}
              <div className="h-full flex flex-col justify-between text-xs text-gray-400 pr-2 relative -top-2">
                <span>1000</span>
                <span>800</span>
                <span>600</span>
                <span>400</span>
                <span>200</span>
                <span className="text-transparent">0</span> {/* 0 line placeholder */}
              </div>
              {/* 차트 막대 (pb-5 for month labels) */}
              <div className="w-full h-full flex items-end justify-between border-l border-b border-gray-200 pl-2 pb-5">
                {chartData.map((bar) => (
                  <div key={bar.month} className="flex flex-col items-center w-[6%] h-full justify-end">
                    <div
                      className="w-1/2 bg-[#79D7BE] rounded-t"
                      style={{ height: `${bar.value / 10.2}%` }} // 1020 max = 100%
                    ></div>
                    <span className="text-xs text-gray-400 mt-1">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* 2. 지원자 순위 - Fix 4: 간격 및 태그 크기 수정 */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-100">
              {applicants.map((applicant) => (
                <li key={applicant.rank} className="flex items-center justify-between py-4"> {/* Fix 4: 일관된 py-4 간격 */}
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium text-gray-500 w-4">{applicant.rank}</span>
                    <span className="text-lg font-semibold text-gray-800">{applicant.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-800">{applicant.score}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium min-w-[90px] text-center {/* Fix 4: 태그 크기 고정 */}
                        ${applicant.role === "Back-End"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                        }`}
                    >
                      {applicant.role}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 3. 세 번째 섹션 (템플릿) ---
const TemplatesSection = () => {
  return (
    <section className="h-screen w-full flex items-center justify-center bg-white py-20">
      <div className="container mx-auto flex items-center justify-between px-8">
        
        {/* 왼쪽 텍스트 */}
        <div className="flex flex-col gap-4 max-w-md">
          <p className="text-lg text-gray-500">깔끔한 채용을 위한</p>
          <h2 className="text-4xl font-bold text-gray-800">이력서 템플릿 제공</h2>
        </div>

        {/* 오른쪽 템플릿 카드 */}
        <div className="relative w-full max-w-lg h-[420px] flex justify-center items-center">
          
          {/* Template A (뒤) */}
          <div className="absolute z-0 w-80 bg-white rounded-xl shadow-2xl p-6 transform -translate-x-20 translate-y-6">
            <div className="w-full h-80 bg-gray-200 rounded-lg"></div>
            <div className="flex justify-between items-center mt-4"></div>
            <p className="text-lg font-medium text-gray-800">Template A</p>
          </div>

          {/* Template B (앞) */}
          <div className="absolute z-10 w-80 bg-white rounded-xl shadow-2xl p-6 transform translate-x-10 -translate-y-4">
            <div className="w-full h-80 bg-gray-200 rounded-lg"></div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg font-medium text-gray-800">Template B</p>
              <div 
                className="px-4 py-2 bg-white text-[#1AC0A4] border border-[#1AC0A4] rounded-md text-sm font-medium"
              >
                다운로드
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// 메인 페이지
export default function MainPage() {
  return (
    <div className="w-full bg-white">
      {/* 헤더를 고정합니다. */}
      <Header />

      {/* 스크롤 가능한 메인 컨텐츠 */}
      <main>
        {/* 첫 번째 섹션 */}
        <HeroSection />

        {/* TODO: 여기에 두 번째 섹션을 추가하세요.
          <SectionTwo /> 
        */}
        <StatsSection />
        
        {/* TODO: 여기에 세 번째 섹션을 추가하세요.
          <SectionThree /> 
        */}
        <TemplatesSection />
      </main>
    </div>
  );
}

