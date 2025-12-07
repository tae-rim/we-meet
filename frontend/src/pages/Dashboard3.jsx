import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// VS Code 환경을 기준으로, 표준 React 컴포넌트 경로(대문자)로 수정합니다.
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchApplicantDetail } from '../api';

// ★ [추가 1] React-PDF 라이브러리 및 스타일
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ★ [추가 2] PDF Worker 설정 (필수)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    // 1. applicant 데이터가 없으면 리턴
    if (!applicant) return textItem.str;

    // 2. 하이라이트할 소스 찾기 (keywords가 없으면 certification, jobRole 순으로 대체)
    // 이렇게 하면 DB 컬럼이 없어도 자격증 단어들이라도 하이라이트 됩니다.
    const targetSource = applicant.keywords || applicant.certification || applicant.job_role || "";
    
    const keywords = targetSource.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length === 0) return textItem.str;

    // (이하 정규식 로직 동일)
    const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

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
  const safePdfUrl = encodeURI(pdfUrl);

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
          <div className="col-span-2 bg-gray-200 rounded-lg flex flex-col items-center p-4 min-h-[calc(100vh-160px)] max-h-[calc(100vh-160px)] overflow-y-auto shadow-inner border border-gray-300">
            
            {pdfUrl ? (
              <Document
                file={safePdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="mt-10 text-gray-500">이력서를 불러오는 중...</div>}
                error={<div className="mt-10 text-red-500">PDF 파일을 불러올 수 없습니다.</div>}
                className="flex flex-col gap-4"
              >
                {/* 페이지 수만큼 반복해서 렌더링 */}
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="shadow-lg">
                    <Page
                      key={`page_${index + 1}_${applicant?.keywords ? 'loaded' : 'loading'}`}        
                      pageNumber={index + 1}
                      width={700} // 화면 크기에 맞춰 조절
                      customTextRenderer={highlightPattern} // ★ 하이라이트 함수 연결
                      renderTextLayer={true}
                      renderAnnotationLayer={false} 
                    />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-lg font-medium">PDF 파일이 없습니다.</p>
                <p className="text-sm">분석 결과에 파일 정보가 없습니다.</p>
              </div>
            )}
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
