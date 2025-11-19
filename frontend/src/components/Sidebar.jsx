import React, { useState } from 'react';
// IconSet.jsx에서 아이콘들을 가져옵니다.
import { AnalysisIcon, UserIcon, ArchiveIcon } from './IconSet';

export default function Sidebar() {
  // 현재 활성화된 메뉴를 추적하는 state
  const [activeMenu, setActiveMenu] = useState('analysis'); // 기본값 '분석결과'

  const menuItems = [
    { id: 'analysis', name: '분석결과', Icon: AnalysisIcon },
    { id: 'archive', name: '이전 데이터', Icon: ArchiveIcon },
  ];

  return (
    // 헤더 높이(68px)만큼 위에서 띄우고, 화면 높이만큼 고정
    <aside className="w-60 h-[calc(100vh-68px)] fixed top-[68px] left-0 bg-gray-50 p-4 pt-8 border-r border-gray-200">
      <nav>
        <ul>
          {menuItems.map(({ id, name, Icon }) => (
            <li key={id} className="mb-2">
              <a
                href="#" // TODO: 실제 라우팅 경로로 변경 (예: /dashboard/analysis)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeMenu === id
                    ? 'bg-[#1AC0A4]/20 text-[#1AC0A4]' // 활성 상태
                    : 'text-gray-600 hover:bg-gray-200' // 비활성 상태
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(id);
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

