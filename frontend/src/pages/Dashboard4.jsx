import React from 'react';
import '../styles/Dashboard4.css'; // 이 페이지 전용 CSS
import PlusIcon from '../components/IconSet'; // 'plus' 아이콘 사용

// 오른쪽 목록을 위한 예시 데이터
const mockApplicants = [
  { id: 1, name: '김OO' },
  { id: 2, name: '박OO' },
  { id: 3, name: '이OO' },
  { id: 4, name: '최OO' },
  { id: 5, name: '김OO' },
  { id: 6, name: '박OO' },
  { id: 7, name: '김OO' },
  { id: 8, name: '박OO' },
  { id: 9, name: '이OO' },
  { id: 10, name: '이OO' },
];

const Dashboard4 = () => {
  return (
    // Dashboard2와 동일한 밝은 배경을 사용합니다.
    <main className="dashboard-content-light dashboard4-layout">
      
      {/* 1. 비교 슬롯 A (왼쪽) */}
      <section className="comparison-slot">
        <span>지원자 A를 추가하세요.</span>
      </section>

      {/* 2. 비교 슬롯 B (중간) */}
      <section className="comparison-slot">
        <span>지원자 B를 추가하세요.</span>
      </section>

      {/* 3. 지원자 목록 (오른쪽) */}
      <aside className="applicant-list-panel">
        
        {/* 3-1. 타이틀 */}
        <h3>지원자 순위</h3>
        
        {/* 3-2. 스크롤 가능한 목록 */}
        <div className="applicant-list-sidebar">
          {mockApplicants.map((applicant, index) => (
            <div key={applicant.id} className="applicant-row-item">
              <span className="rank">{index + 1}</span>
              <span className="name">{applicant.name}</span>
              
              {/* 'plus' 아이콘 버튼 */}
              <button className="add-button">
                <PlusIcon/>
              </button>
            </div>
          ))}
        </div>
      </aside>

    </main>
  );
};

export default Dashboard4;