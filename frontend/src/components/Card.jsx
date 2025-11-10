// src/components/TemplateCard.jsx
// 반복 콘텐츠, Frame 162/Frame 78

// src/components/Card.jsx
import React from "react";

export default function Card({ title, subtitle, user, status }) {
  return (
    <div className="bg-[#EBE9FB] rounded-xl shadow-inner p-4 flex flex-col gap-4 w-full max-w-sm">
      {/* 카드 제목 */}
      <h3
        className="text-[16px] font-[500] font-[Pretendard]"
        style={{ lineHeight: "140%", letterSpacing: "-0.025em" }}
      >
        {title}
      </h3>

      {/* 카드 서브타이틀 */}
      {subtitle && (
        <p
          className="text-[14px] text-gray-700 font-[Pretendard]"
          style={{ lineHeight: "140%", letterSpacing: "-0.025em" }}
        >
          {subtitle}
        </p>
      )}

      {/* 사용자 정보 + 상태 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
          <span className="text-[14px] text-gray-800 font-[Pretendard]">{user}</span>
        </div>

        {/* 상태 배지 */}
        <span
          className="px-2 py-0.5 rounded-md text-white text-[13px] font-[Pretendard]"
          style={{ backgroundColor: status === "ON" ? "#5F43FF" : "#999999" }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

