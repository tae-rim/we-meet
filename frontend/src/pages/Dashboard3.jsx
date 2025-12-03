import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// VS Code 환경을 기준으로, 표준 React 컴포넌트 경로(대문자)로 수정합니다.
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchApplicantDetail } from '../api';

// ★ [추가 1] React-PDF 라이브러리 및 스타일
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';


// ★ [추가 2] PDF Worker 설정 (필수)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * 지원자 상세 정보 페이지
 */
export default function Dashboard3({ isLoggedIn, currentUser, onLogout }) {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  // ★ [추가 3] PDF 페이지 수 상태 관리
  const [numPages, setNumPages] = useState(null);

    useEffect(() => {
    const fetchApplicant = async () => {
      try {
        // 백엔드 분석 결과 API 호출
        const data = await fetchApplicantDetail(id);
        setApplicant(data);
      } catch (err) {
        console.error(err);
        setApplicant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [id]);

  // ★ [추가 4] PDF 로드 성공 시 페이지 수 설정 함수
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

// ★ [핵심] 하이라이트 로직 (Custom Text Renderer)
  const highlightPattern = (textItem) => {
    // 키워드가 없으면 그냥 글자만 리턴
    if (!applicant || !applicant.keywords) return textItem.str;

    // DB에 저장된 "Python, AWS, Master" 같은 문자열을 배열로 변환
    const keywords = applicant.keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length === 0) return textItem.str;

    // 정규식으로 키워드 찾기 (대소문자 무시)
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    
    // 매칭되는 부분을 <mark> 태그(노란 형광펜)로 감싸서 리턴
    return textItem.str.split(regex).map((part, index) => 
      regex.test(part) ? <mark key={index} style={{ backgroundColor: '#ffeb3b' }}>{part}</mark> : part
    );
  };

  if (loading) return <div className="p-12 text-center text-lg">데이터를 불러오는 중...</div>;

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

  // ★ 데이터 안전하게 꺼내기 (대문자/소문자 모두 대응)
  const name = applicant.Job_Applicant_Name || applicant.name || "이름 없음";
  const jobRole = applicant.Job_Roles || applicant.job_role || "";
  const score = applicant.Score || applicant.score || 0;
  const education = applicant.Education || applicant.education || "정보 없음";
  const certification = applicant.Certification || applicant.certification || "정보 없음";
  const resumeSummary = applicant.Resume || applicant.resume_summary || "요약 정보가 없습니다.";
  const pdfUrl = applicant.Pdf_Url || applicant.pdf_url;

  // 4. 지원자 정보가 있을 경우 (정상 화면)
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
          
          {/* 왼쪽 정보 영역 */}
          <div className="col-span-1 flex flex-col gap-6">
            
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${jobTagClass}`}>
                {jobRole}
              </span>
            </div>

            {/* 점수 */}
            <InfoCard title="종합 점수" value={typeof score === 'number' ? score.toFixed(2) : "0.00"} />
            
            {/* 학력 */}
            <InfoCardLong title="학력" text={education} />
            
            {/* 자격증 */}
            <InfoCardLong title="자격증" text={certification} />
            
            {/* 이력서 요약 */}
            <InfoCardLong title="이력서 요약" text={resumeSummary} />
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
