// src/components/Template.jsx
import React from "react";

export default function Template({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* children으로 들어온 페이지 컨텐츠를 렌더링 */}
      {children}
    </div>
  );
}

