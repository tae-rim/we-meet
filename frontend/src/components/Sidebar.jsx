import React, { useState } from 'react';
// IconSet.jsx에서 아이콘들을 가져옵니다.
import { AnalysisIcon, ArchiveIcon } from './IconSet';
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardIcon, FolderIcon } from "./IconSet";
import { fetchHistoryList } from '../api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  // 현재 활성화된 메뉴를 추적하는 state
  // --- [상태 관리] ---
  const [showHistory, setShowHistory] = useState(false); // 모달 표시 여부
  const [historyList, setHistoryList] = useState([]);    // 받아온 기록 리스트

  // --- [기능 1] 히스토리 데이터 가져오기 (이전 데이터 클릭 시) ---
  const fetchHistory = async () => {
    try {
      // 백엔드에서 히스토리 목록 요청
      const data = await fetchHistoryList();
      setHistoryList(data);
      setShowHistory(true); // 성공하면 모달 열기
    } catch (error) {
      console.error("히스토리 로드 실패:", error);
if  (error.response && error.response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("이전 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    }
  };

  // --- [기능 2] 과거 기록 클릭 시 해당 데이터로 이동 ---
  const handleHistoryClick = (jobId) => {
    // 1. 보고 싶은 ID를 로컬 스토리지에 저장
    localStorage.setItem("latestJobId", jobId);
    
    // 2. 모달 닫기
    setShowHistory(false);
    
    // 3. 대시보드로 이동 (이미 대시보드라면 새로고침해서 데이터 갱신)
    navigate("/dashboard2");
    window.location.reload(); 
  };

  // 메뉴 스타일 결정 함수
  const getMenuClass = (path) => {
    // 현재 경로와 일치하면 색상 강조
    return location.pathname === path
      ? "bg-[#1AC0A4]/20 text-[#1AC0A4]" 
      : "text-gray-600 hover:bg-gray-200";
  };

  const menuItems = [
    { id: 'analysis', name: '분석 결과', Icon: AnalysisIcon },
    { id: 'archive', name: '이전 데이터', Icon: ArchiveIcon },
  ];

return (
    <>
      {/* --- 사이드바 본체 --- */}
      <aside className="w-60 h-[calc(100vh-68px)] fixed top-[68px] left-0 bg-gray-50 p-4 pt-8 border-r border-gray-200 z-40">
        <nav>
          <ul>
            
            {/* 1. 분석결과 메뉴 */}
            <li className="mb-2">
              <div
                onClick={() => navigate("/dashboard2")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer font-medium ${getMenuClass("/dashboard2")}`}
              >
                <AnalysisIcon className="w-5 h-5" />
                <span>분석 결과</span>
              </div>
            </li>

            {/* 2. 이전 데이터 메뉴 (클릭 시 모달) */}
            <li className="mb-2">
              <div
                onClick={fetchHistory}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer font-medium text-gray-600 hover:bg-gray-200"
              >
                <ArchiveIcon className="w-5 h-5" />
                <span>이전 데이터</span>
              </div>
            </li>

          </ul>
        </nav>
      </aside>

      {/* --- [모달] 이전 데이터 리스트 팝업 --- */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[500px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">이전 분석 기록</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* 모달 리스트 영역 */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {historyList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  저장된 분석 기록이 없습니다.
                </div>
              ) : (
                historyList.map((job) => (
                  <div 
                    key={job.id}
                    onClick={() => handleHistoryClick(job.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#1AC0A4] hover:bg-[#F0FDFA] cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div>
                      {/* 직무 제목 (없으면 날짜나 ID 표시) */}
                      <p className="font-bold text-gray-800 group-hover:text-[#1AC0A4]">
                        {job.title || `분석 작업 #${job.id}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {/* 날짜 예쁘게 표시 */}
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* 상태 뱃지 */}
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${job.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'}`}>
                      {job.status === 'COMPLETED' ? '완료' : '실패'}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

