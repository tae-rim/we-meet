import React, { useEffect, useState } from 'react';
import { ArrowIcon } from "../components/IconSet"; // PascalCase
import { useNavigate } from "react-router-dom";
// 얘는 Dashboard1의 컴포넌트인 느낌. 그래서 Header와 Sidebar는 Dashboard1에서 불러쓰는걸로.

import { fetchAnalysisResults } from '../api'; // <-- API 함수 import

/**
 * 분석 완료 리포트 컴포넌트 (Dashboard1이 100% 완료되면 렌더링됨)
 */
export default function Dashboard2() {
  
  const navigate = useNavigate();

    // ✅ 1) 서버에서 가져온 데이터를 저장할 state
  const [applicants, setApplicants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ 2) 컴포넌트가 켜질 때 API 요청
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedId = localStorage.getItem("latestJobId") || 1;
        
        console.log(`Job ID ${storedId}의 데이터를 불러옵니다...`);

        const result = await fetchAnalysisResults(storedId);

        // 2. 작업 메타데이터 가져오기 (전체 지원자 수 포함)
        // fetchAnalysisJob 함수가 api.js에 추가되었으므로 호출 가능
        const jobInfo = await fetchAnalysisJob(storedId);
        setTotalCount(jobInfo.total_count); // DB에 저장된 전체 수

        // jobInfo가 존재하고 total_count가 있는 경우에만 설정
        if (jobInfo && jobInfo.total_count !== undefined) {
             setTotalCount(jobInfo.total_count);
        } else {
             // 만약 API가 없거나 에러가 나면, 현재 리스트 길이로 대체하거나 0으로 설정
             // 여기서는 현재 리스트 길이로 대체 (임시 방편)
             setTotalCount(result.length); 
        }

        const sortedResult = [...result].sort((a, b) => {
             const scoreA = a.Score || a.score || 0;
             const scoreB = b.Score || b.score || 0;
             return scoreB - scoreA;
        });
        
        setApplicants(sortedResult); // 받아온 데이터를 state에 저장
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
        {/* 1. 전체 지원자 수 (DB에서 가져온 값) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <p className="text-gray-500">전체 지원자 수</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">
            {totalCount} <span className="text-xl font-medium">명</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-500">선택된 직무의 지원자 수</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              {applicants.length} <span className="text-xl font-medium">명</span>
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-500">평균 점수</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              {applicants.length > 0 
                ? (applicants.reduce((acc, curr) => acc + (curr.Score || curr.score || 0), 0) / applicants.length).toFixed(1) 
                : 0} <span className="text-xl font-medium">점</span>
            </h3>
          </div>
        </div>
      </section>

      {/* 2. 지원자 순위 섹션 */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-800">지원자 순위</h2>
        
        {/* ★ 수정: 그리드 제거하고 하나의 큰 박스로 변경 */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          
          <ApplicantListHeader />
          
          <div className="flex flex-col divide-y divide-gray-100">
            {/* 전체 지원자를 한 번에 렌더링 */}
            {applicants.map((item, index) => (
              <ApplicantRow 
                key={item.id || index}
                data={item} 
                onViewOriginal={handleViewOriginal} 
              />
            ))} 
          </div>

        </div>
      </section>

    </div>
  );
};


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
  // 1. [핵심 수정] 대문자(Schema) 또는 소문자(DB) 키가 와도 모두 처리하도록 OR(||) 연산자 사용
  const rank = data.Rank || data.rank || 0;
  const name = data.Job_Applicant_Name || data.name || "이름 없음";
  const score = data.Score || data.score || 0;
  const jobRole = data.Job_Roles || data.job_role || ""; // DB 컬럼명이 job_role일 수 있음

const getJobTagClass = (role) => {
  const r = role.toLowerCase();

  // 1. 개발 (Developer, Software, Web)
  if (r.includes('software') || r.includes('web') || r.includes('developer')) {
    return 'bg-teal-100 text-teal-700'; 
  }

  // 2. AI / 데이터 / 로봇
  if (
    r.includes('data') ||
    r.includes('ai') ||
    r.includes('machine') ||
    r.includes('robotics')
  ) {
    return 'bg-sky-100 text-sky-700';
  }

  // 3. 디자인 (UX, UI, Designer)
  if (r.includes('designer') || r.includes('ux') || r.includes('ui')) {
    return 'bg-pink-100 text-pink-700';
  }

  // 4. 인프라 / 보안 (Cloud, Security, Infra)
  if (r.includes('cloud') || r.includes('security') || r.includes('infra')) {
    return 'bg-violet-100 text-violet-700';
  }

  // 5. 기획 / 매니징 (Product, PM, Manager)
  if (r.includes('product') || r.includes('manager') || r.includes('pm')) {
    return 'bg-yellow-100 text-yellow-700';
  }

  // 기본값 — 소프트 그레이
  return 'bg-gray-100 text-gray-700';
};

  const jobTagClass = getJobTagClass(jobRole);


  return (
    <div className="grid grid-cols-5 gap-4 py-4 px-4 items-center text-gray-700">
      
      {/* ★ 수정: data.rank -> data.Rank */}
      <span className="font-medium text-gray-500">{rank}</span>
      
      {/* ★ 수정: data.name -> data["Job Applicant Name"] */}
      <span className="font-semibold">{name}</span>
      
      {/* ★ 수정: data.score -> data.Score, 소수점 2자리 */}
      <span className="font-medium">
              {typeof score === 'number' ? score.toFixed(2) : "0.00"}
            </span>
      
      <span className="job">
        {/* ★ 수정: data.job -> data["Job Roles"] */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${jobTagClass}`}>
          {jobRole}
        </span>
      </span>
      <button
        className="text-right text-[#1AC0A4] hover:text-[#169a83]"
        onClick={() => onViewOriginal(data.id)} 
      >
        <ArrowIcon className="w-5 h-5 inline-block" />
      </button>
    </div>
  );
};