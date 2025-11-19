import React, { useEffect, useState } from 'react';
import { ArrowIcon } from "../components/IconSet"; // PascalCase
import { useNavigate } from "react-router-dom";
// 얘는 Dashboard1의 컴포넌트인 느낌. 그래서 Header와 Sidebar는 Dashboard1에서 불러쓰는걸로.

import { fetchAnalysisResults } from '../api'; // <-- API 함수 import

import chartData from '../chartdata.json';

/**
 * 분석 완료 리포트 컴포넌트 (Dashboard1이 100% 완료되면 렌더링됨)
 */
export default function Dashboard2() {
  
  const navigate = useNavigate();

    // ✅ 1) 서버에서 가져온 데이터를 저장할 state
  const [applicants, setApplicants] = useState([]);

  // ✅ 2) 컴포넌트가 켜질 때 API 요청
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchAnalysisResults(1); // 예: ID = 1
        setApplicants(result); // 받아온 데이터를 state에 저장
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };

    loadData();
  }, []);

  // ✅ 새 버전
  const column1Data = applicants.slice(0, 15);
  const column2Data = applicants.slice(15, 30);

  const handleViewOriginal = (rank) => {
    navigate(`/dashboard3/${rank}`);
  };

  return (
    // 메인 컨텐츠 영역 (Tailwind CSS 적용)
    <div className="w-full flex flex-col gap-10">
      
      {/* 1. 통계 지표 섹션 */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">통계지표</h2>
        </div>

        {/* 1-1. 통계 박스 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-500">전체 지원자 수</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              1,294 <span className="text-xl font-medium">명</span>
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-500">평균 점수</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              79.3 <span className="text-xl font-medium">점</span>
            </h3>
          </div>
        </div>

        {/* 1-2. 차트 1개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BarChart title="월별 지원자 수" />
        </div>
      </section>

      {/* 2. 지원자 순위 섹션 */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-800">지원자 순위</h2>
        
        {/* 2-1. 지원자 목록 (2열 그리드) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽 열 (1-15위) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <ApplicantListHeader />
            <div className="flex flex-col divide-y divide-gray-100">
              {column1Data.map((item) => (
                <ApplicantRow 
                  key={item.Rank} 
                  data={item} 
                  onViewOriginal={handleViewOriginal} 
                />
              ))} 
            </div>
          </div>

          {/* 오른쪽 열 (16-30위) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <ApplicantListHeader />
            <div className="flex flex-col divide-y divide-gray-100">
              {column2Data.map((item) => (
                <ApplicantRow 
                  key={item.Rank} 
                  data={item} 
                  onViewOriginal={handleViewOriginal} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// --- 하위 컴포넌트 ---

// 막대 차트
const BarChart = ({ title }) => (
  <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold text-gray-700">{title} (CHART TEXT)</span>
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
      {/* 차트 막대 */}
      <div className="w-full h-full flex items-end justify-between border-l border-b border-gray-200 pl-2 pb-5">
        {chartData.map((bar) => (
          <div key={bar.month} className="flex flex-col items-center w-[6%] h-full justify-end">
            <div
              className="w-1/2 bg-[#79D7BE] rounded-t-sm"
              style={{ height: `${bar.value / 10.2}%` }} // 1020 max = 100%
            ></div>
            <span className="text-xs text-gray-400 mt-1">{bar.month}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);


// 지원자 리스트 헤더
const ApplicantListHeader = () => (
  <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">
    <span className="text-left">순위</span>
    <span className="text-left">이름</span>
    <span className="text-left">종합점수</span>
    <span className="text-left">직무</span>
    <span className="text-right">원본확인</span>
  </div>
);

// 지원자 한 줄(Row) 컴포넌트
const ApplicantRow = ({ data, onViewOriginal }) => {
  const jobTagClass = data["Job Roles"] === 'Front-end'
    ? 'bg-orange-100 text-orange-700'
    : 'bg-green-100 text-green-700';


  return (
    <div className="grid grid-cols-5 gap-4 py-4 px-4 items-center text-gray-700">
      
      {/* ★ 수정: data.rank -> data.Rank */}
      <span className="font-medium text-gray-500">{data.Rank}</span>
      
      {/* ★ 수정: data.name -> data["Job Applicant Name"] */}
      <span className="font-semibold">{data["Job Applicant Name"]}</span>
      
      {/* ★ 수정: data.score -> data.Score, 소수점 2자리 */}
      <span className="font-medium">{data.Score.toFixed(2)}</span>
      
      <span className="job">
        {/* ★ 수정: data.job -> data["Job Roles"] */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${jobTagClass}`}>
          {data["Job Roles"]}
        </span>
      </span>
      <button
        className="text-right text-[#1AC0A4] hover:text-[#169a83]"
        onClick={() => onViewOriginal(data.Rank)} // ★ 수정: data.rank -> data.Rank
      >
        <ArrowIcon className="w-5 h-5 inline-block" />
      </button>
    </div>
  );
};