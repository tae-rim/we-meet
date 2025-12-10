// src/pages/Upload1.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone"; 
import Header from "../components/Header";
import { PlusIcon, FileIcon, XIcon } from "../components/IconSet";
import { useNavigate } from "react-router-dom";
import { predictAI } from "../api";
import certificationsData from "../assets/data/certification.json"; 

const SelectBox = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-gray-700 font-semibold text-lg">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-100 
                 focus:outline-none focus:ring-2 focus:ring-[#1AC0A4] focus:border-transparent"
    >
      <option value="">{label} 선택</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function Upload({ isAnalyzing, setIsAnalyzing, setProgress, progress, isLoggedIn, currentUser, onLogout }) {
  // --- State 정의 ---
  const [uploadedFiles, setUploadedFiles] = useState([]); // File 객체 배열
  const [criteria, setCriteria] = useState(""); // 인재상(채용 기준) 입력값
  
    // 2. 새로 추가된 Select Box state
  const [job, setJob] = useState("");
  const [degree, setDegree] = useState("");
  const [license, setLicense] = useState("");
  const certificationOptions = job ? certificationsData[job] || [] : [];
  
  const navigate = useNavigate();

  // --- Dropzone 핸들러 ---
  const onDrop = useCallback((acceptedFiles) => {
    // 중복 파일 방지 (선택 사항)
    const newFiles = acceptedFiles.filter(newFile => 
      !uploadedFiles.some(existingFile => existingFile.name === newFile.name)
    );
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [uploadedFiles]); // uploadedFiles를 의존성 배열에 추가

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    // noClick: true, // <- '파일 업로드' 버튼으로만 제어하려면 이 주석을 푸세요.
    noKeyboard: true,
  });

  // --- 일반 핸들러 ---
  const handleRemoveFile = (fileNameToRemove) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

const handleAnalysisStart = async () => {
  setIsAnalyzing(true);
  setProgress(0);

  try {
    // 예: criteria(채용 기준) 텍스트를 AI 서버에 보내서 예측
    const aiResult = await predictAI(uploadedFiles[0], criteria, job, degree, license, (percent) => setProgress(percent));
    // --- 여기 오면 업로드 및 분석 완료 ---
    setProgress(100); // 강제로 100% 채우기    
    console.log("AI 결과:", aiResult.result);

    // ★ [추가] 방금 만든 Job ID를 로컬 스토리지에 저장!
    if (aiResult && aiResult.id) {
        console.log("생성된 Job ID:", aiResult.id);
        localStorage.setItem("latestJobId", aiResult.id);
    }
    
    // 약간의 딜레이 후 이동 (100%를 눈으로 볼 시간을 줌)
    setTimeout(() => {
        setIsAnalyzing(false);
        navigate("/dashboard1", { state: { aiResult } });
    }, 500);
  } catch (err) {
    console.error("AI 요청 실패:", err);
    setIsAnalyzing(false);
    alert("분석 중 오류가 발생했습니다. (서버 연결 확인 필요)");
  }
};

  // 3. 버튼 비활성화 로직 (새로운 state 3개 추가)
  const isButtonDisabled = 
      isAnalyzing || 
      uploadedFiles.length === 0 || 
      criteria.trim() === "" || 
      job === "";


  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. 고정 헤더 */}
            <Header 
              isLoggedIn={isLoggedIn} 
              currentUser={currentUser} 
              onLogout={onLogout} 
            />

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="w-full max-w-5xl mx-auto pt-24 pb-12 px-8">
        <div className="flex flex-col gap-6">
          
          {/* 3. 파일 업로드 드롭존 */}
          <div 
            {...getRootProps()}
            className={`w-full min-h-[20rem] bg-[#DEF5EF]/50 rounded-xl 
                        flex flex-col justify-center items-center gap-4 p-6
                        transition-colors border-2
                        ${isDragActive ? 'border-dashed border-[#1AC0A4] bg-[#DEF5EF]' : 'border-gray-200'}`}
          >
            <input {...getInputProps()} />

            {/* 파일이 없을 때 */}
            {uploadedFiles.length === 0 && (
              <>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 드롭존의 클릭 막기
                    open(); // 파일 탐색기 열기
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-300
                                text-gray-700 font-semibold hover:bg-gray-50 transition-colors z-10">
                  <PlusIcon />
                  <span>파일 업로드</span>
                </button>
                <p className="text-gray-500">
                  {isDragActive ? '파일을 여기에 놓으세요...' : '또는 마우스로 드래그하기'}
                </p>
              </>
            )}

            {/* 파일이 1개 이상 있을 때 (파일 목록 표시) */}
            {uploadedFiles.length > 0 && (
              <div className="w-full h-full flex flex-col gap-3 p-4">
                
                {/* --- FIX 1: file.name으로 수정 --- */}
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="w-full flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4 z-10"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon />
                      {/* file 객체의 .name 속성을 표시합니다. */}
                      <span className="text-gray-800">{file.name}</span>
                    </div>
                    {/* file.name을 기준으로 제거합니다. */}
                    <button onClick={(e) => {
                       e.stopPropagation();
                       handleRemoveFile(file.name);
                    }}>
                      <XIcon />
                    </button>
                  </div>
                ))}
                {/* --- FIX 1 끝 --- */}

                 {/* 파일이 있을 때도 추가 업로드 버튼을 제공 */}
                 <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-white/50 rounded-lg border border-dashed border-gray-400
                              text-gray-600 font-medium hover:bg-white transition-colors z-10"
                >
                  <PlusIcon />
                  <span>파일 더 추가하기</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. ★ 레이아웃 수정: 필터(왼쪽) 및 인재상(오른쪽) 입력 영역 ★ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* 4-1. 왼쪽: 셀렉트 박스 3개 */}
            <div className="flex flex-col gap-6">
              <SelectBox 
                label="직업" 
                value={job} 
                onChange={(val) => {
                  setJob(val);
                  setLicense(""); // 직업 변경 시 자격증 초기화
                }} 
                options={Object.keys(certificationsData)} // JSON에서 자동으로 직업 목록
              />

              <SelectBox 
                label="학위 (선택)" 
                value={degree} 
                onChange={setDegree} 
                options={["Bachelors", "Master", "phD"]} 
              />

              <SelectBox 
                label="자격증 (선택)" 
                value={license} 
                onChange={setLicense} 
                options={certificationOptions} // 직업별 동적 옵션
              />
            </div>

            {/* 4-2. 오른쪽: 인재상(채용 기준) 입력창 */}
            <div className="flex flex-col gap-3">
              <label className="text-gray-700 font-semibold text-lg">
                채용 기준 (인재상)
              </label>
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="채용 기준을 입력해주세요"
                className="w-full min-h-[22.5rem] p-4 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#1AC0A4] focus:border-transparent
                           text-gray-700 placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* 5. 분석 시작하기 버튼 (상태에 따라 변경) */}
          <button
            onClick={handleAnalysisStart}
            // ★ 수정된 부분 ★
            disabled={isButtonDisabled}
            className={`w-full h-16 text-white text-lg font-bold rounded-lg transition-colors
                        ${
                          isButtonDisabled
                            ? "bg-[#1AC0A4]/70 cursor-not-allowed"
                            // 자격증(license)은 선택 안 해도 버튼 활성화
                            : "bg-[#1AC0A4] hover:bg-[#169a83]"
                        }`}
                        >
            {isAnalyzing
              ? (progress < 99 
                  ? `파일 업로드 중입니다... ${progress}%` 
                  : "AI가 열심히 이력서를 분석하고 있습니다...")
              : "분석 시작하기"}
          </button>
        </div>
      </main>
    </div>
  );
}