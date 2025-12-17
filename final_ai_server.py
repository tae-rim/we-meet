import pandas as pd
from docx import Document
from docx2pdf import convert 
from docx.shared import Inches
from typing import Dict, List
import os
import pypdf
import sys
import re
import zipfile
import shutil
import time
import numpy as np
import torch
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify 
from werkzeug.utils import secure_filename
from flask_cors import CORS
import json 

# --------------------------------------------------------------------------
# --- 0. 환경 설정 및 AI 모델 초기화 (서버 시작 시 1회 실행) ---
base_dir = os.getcwd() 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_name = 'paraphrase-multilingual-MiniLM-L12-v2'

# AI 모델 로드
try:
    model = SentenceTransformer(model_name)
    model.to(device)
    print(f"✅ AI Sentence Model '{model_name}' 로드 완료. (장치: {device})")
except Exception as e:
    print(f"오류: AI 모델 로드 실패. CUDA/Torch/Transformers 설치를 확인하세요. - {e}")
    raise

# Flask 애플리케이션 초기화
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# 임시 파일 저장을 위한 폴더 설정
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# --------------------------------------------------------------------------
# --- [1] 파싱 헬퍼 함수 정의 ---

# (A-1) 텍스트 추출 함수
def extract_pdf_text(file_path):
    """PDF 파일의 텍스트를 추출하는 함수"""
    try:
        reader = pypdf.PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text(extraction_mode="layout") + "\n\n"
        return text.strip()
    except Exception as e:
        return f"EXTRACTION_ERROR: {e}"

# (A-2) ZIP 파일 처리 및 PDF 변환 함수
def process_and_convert_resumes(zip_file_path, temp_extract_dir="temp_resumes"):
    """
    ZIP 파일을 열어 DOCX/PDF를 처리하고 PDF 파일 경로 목록을 반환
    """
    converted_pdf_paths = []
    
    if os.path.exists(temp_extract_dir):
        shutil.rmtree(temp_extract_dir)
    os.makedirs(temp_extract_dir)
    
    try:
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            for member in zip_ref.namelist():
                base_name = os.path.basename(member)
                if not base_name: continue
                
                name, ext = os.path.splitext(base_name)
                ext = ext.lower()
                zip_ref.extract(member, temp_extract_dir)
                original_path = os.path.join(temp_extract_dir, member)
                
                if ext == '.docx':
                    pdf_path = os.path.join(temp_extract_dir, f"{name}.pdf")
                    try:
                        convert(original_path, pdf_path)
                        converted_pdf_paths.append(pdf_path)
                    except Exception: pass
                elif ext == '.pdf':
                    converted_pdf_paths.append(original_path)
    except Exception as e:
        print(f"오류 처리 중 문제가 발생했습니다: {e}")
    
    return converted_pdf_paths

# (B-1) 순차적 필드 추출을 위한 범용 함수 (Regex)
def safe_extract_sequential(text, start_label, stop_label=r'[A-Za-z]+:\s*|\s*degree|\s*Skills|\s*Certification|\s*$'):
    """순차적 필드 추출을 위한 범용 함수"""
    pattern = rf'{start_label}\s*(.+?)\s*{stop_label}'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return "N/A"

# (B-2) Skills 5개 항목 리스트 추출
def extract_skills(text):
    """Skills 5개 항목 리스트 추출"""
    pattern = r'Skills\s*(.+?)\s*Certification'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        raw_skills_text = match.group(1).strip()
        skills_list = [
            s.strip() for s in raw_skills_text.split() 
            if s.strip() and 
            s.strip() not in ['Institution', 'Date', 'Roel', 'Skills']
        ]
        return skills_list[:5]
    return []

# (B-3) Certification 항목 추출
def extract_certification(text):
    """Certification 항목 추출"""
    pattern = r'Certification\s*(.+)'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        raw_cert_text = match.group(1).strip()
        cert = re.sub(r'Name\s*Date\s*Institution\s*', '', raw_cert_text, flags=re.IGNORECASE).strip()
        return cert
    return "N/A"


# (C) 단일 PDF 파싱 함수
def parse_single_resume(file_path: str) -> Dict[str, str]:
    """단일 PDF 파일에서 8가지 필수 정보를 추출하는 메인 파싱 함수"""
    
    extracted_text = extract_pdf_text(file_path)
    if extracted_text.startswith("EXTRACTION_ERROR"):
        return {"File_Name": os.path.basename(file_path), "Parsing_Status": extracted_text}

    # [노이즈 처리 로직]
    # (1) 흰 글씨 및 제어 문자 제거
    # 0x00~0x1F 사이의 제어 문자를 제거 (비인쇄 문자)
    cleaned_text = re.sub(r'[\x00-\x1F\x7F]', '', extracted_text) 

    # (2) 오타/동의어 정규화 (자주 발생하는 오타나 동의어를 표준화)
    typo_map = {
        'Pyhon': 'Python',
        'Cybersecuruty': 'Cybersecurity',
        'Analystt': 'Analyst',
        'Bachlor': 'Bachelor',
        'Masteer': 'Master',
        'Certificaton': 'Certification',
    }

    for typo, correct in typo_map.items():
        # 대소문자 무시하고 치환
        cleaned_text = re.sub(typo, correct, cleaned_text, flags=re.IGNORECASE) 

    # (3) 연속된 공백 및 줄바꿈 정리 (기존 로직 유지)
    cleaned_text = re.sub(r'\s{2,}', ' ', cleaned_text).strip()
    
    
    # 3. 핵심 정보 추출 (정규 표현식 적용)
    name = safe_extract_sequential(cleaned_text, r'Name', r'Age')
    age = safe_extract_sequential(cleaned_text, r'Age', r'Gender')
    gender = safe_extract_sequential(cleaned_text, r'Gender', r'Job roles')
    job_roles = safe_extract_sequential(cleaned_text, r'Job roles', r'Level')
    level = safe_extract_sequential(cleaned_text, r'Level', r'Degree')
    degree = safe_extract_sequential(cleaned_text, r'Degree', r'Skills')
    
    skills_list = extract_skills(cleaned_text)
    certification = extract_certification(cleaned_text)
    
    # 4. 최종 데이터 구조화
    parsed_data = {
        "File_Name": os.path.basename(file_path), "Parsing_Status": "SUCCESS",
        "Name": name, "Age": age, "Gender": gender, "Job Roles": job_roles, 
        "Level": level, "Degree": degree, "Certification": certification,
        "Raw_Text": extracted_text 
    }
    
    # 5. Skills 5개 항목 분리 추가
    for i in range(5):
        parsed_data[f'Skill_{i+1}'] = skills_list[i] if i < len(skills_list) else ""
        
    return parsed_data

# --------------------------------------------------------------------------
# --- [2] 통합 실행 함수: 파싱 결과를 AI 모델의 입력으로 연결 ---

# 요약 문장 생성 헬퍼 함수
    """
    각 지원자의 파싱된 정보를 기반으로 'Proficient in...' 형태의 자연어 요약 문장을 생성
    """
def _create_natural_language_summary(row):
    # 1. Skills 조합
    skills = [row[f'Skill_{i+1}'] for i in range(5) if row[f'Skill_{i+1}']]
    skills_str = ', '.join(skills)
    
    # 2. Level, Degree, Certification
    level = row['Level']
    degree = row['Degree']
    certification = row['Certification']
    
    # 3. 문장 구성
    
    # 3.1. Main Phrase (Skills + Level)
    main_phrase = f"Proficient in {skills_str}" if skills_str else "Proficient in unspecified skills"
    
    if level and level != 'N/A':
        main_phrase += f", with {level}-level experience in the field"
    else:
        main_phrase += ", with unspecified experience in the field"

    # 3.2. Secondary Phrases (Degree, Cert)
    summary = main_phrase.capitalize()
    
    if degree and degree != 'N/A':
        summary += f". Holds a {degree} degree"
    
    if certification and certification != 'N/A':
        summary += f". Holds certifications such as {certification}"
        
    # 3.3. Standard Closing
    summary += ". Skilled in delivering results and adapting to dynamic environments."

    return summary


## API 요청을 받아 ZIP 파일을 처리하고 파싱, 벡터화, 랭킹까지 통합 실행하는 함수
def run_integrated_parsing(zip_file_path, new_job_description: str):
    
    # 1. ZIP 파일 처리 및 PDF 변환 -> PDF 경로 리스트 획득
    prepared_files = process_and_convert_resumes(zip_file_path, temp_extract_dir="temp_resumes") 

    if not prepared_files:
        return {"status": "ERROR", "message": "처리할 PDF 파일이 없거나 ZIP 파일 처리 실패"}
        
    all_parsed_results = []
    print(f"\n--- 1. 배치 파싱 시작: 총 {len(prepared_files)}개 파일 ---")
    
    # 2. PDF 파일 목록을 순회하며 파싱 실행
    for file_path in prepared_files:
        result = parse_single_resume(file_path)
        all_parsed_results.append(result)
        
    # 파싱 결과 DataFrame으로 변환
    df_parsed = pd.DataFrame(all_parsed_results)
    
    df_parsed.fillna('', inplace=True)
    
    HEADER_PATTERN = r'Name of University Major Degree GPA'
    df_parsed['Degree'] = df_parsed['Degree'].str.replace(HEADER_PATTERN, '', regex=True).str.strip()


    # 3. AI 모델의 입력 포맷에 맞게 데이터 전처리 (combined_profile 생성)
    # 요약 문장은 combined_profile 컬럼에 저장
    df_parsed['combined_profile'] = df_parsed.apply(_create_natural_language_summary, axis=1)


    # 4. '새 인재상'과 '파싱된 이력서' 벡터화 및 랭킹    
    parsed_profiles_list = df_parsed['combined_profile'].tolist()
    parsed_vectors = model.encode(parsed_profiles_list, show_progress_bar=False, device=device)
    
    job_vector = model.encode([new_job_description], show_progress_bar=False, device=device)
    
    all_scores = cosine_similarity(job_vector, parsed_vectors)[0]
    df_parsed['Score'] = all_scores
    
    # 5. 최종 정렬 및 JSON 반환
    df_ranked = df_parsed.sort_values(by='Score', ascending=False).reset_index(drop=True)
    df_ranked['Rank'] = np.arange(1, len(df_ranked) + 1)
    
    # 임시 폴더 삭제 (보안 및 정리)
    shutil.rmtree("temp_resumes")
    
    # 최종 결과 필드 선택: 'combined_profile' 컬럼을 'Resume'로 이름을 변경하여 포함
    final_output_columns = [
        'Rank', 'Score', 'Name', 'Job Roles', 'Degree', 'Certification', 
        'Skill_1', 'Skill_2', 'combined_profile' 
    ]
    
    # 컬럼 이름을 'combined_profile'에서 'Resume'로 최종 변경하여 백엔드에 반환
    df_output = df_ranked[final_output_columns].rename(columns={'combined_profile': 'Resume'})

    # JSON 형식으로 변환하여 반환 (API 응답 형식)
    return df_output.to_dict(orient='records')

# --------------------------------------------------------------------------
# --- [3] 백엔드 API 엔드포인트 구현 ---
# POST 요청을 받아 ZIP 파일을 처리하고 랭킹 결과를 JSON으로 반환

@app.route('/api/v1/screen', methods=['POST'])

def screen_resumes():
    
    if 'file' not in request.files or 'job_description' not in request.form:
        return jsonify({"status": "ERROR", "message": "필수 입력값(file, job_description)이 누락되었습니다."}), 400

    zip_file = request.files['file']
    new_job_description = request.form['job_description']

    if zip_file.filename == '':
        return jsonify({"status": "ERROR", "message": "파일 이름이 없습니다."}), 400
        
    # 전송된 ZIP 파일을 VM의 UPLOAD_FOLDER에 임시 저장
    filename = secure_filename(zip_file.filename)
    zip_file_path = os.path.join(UPLOAD_FOLDER, filename)
    zip_file.save(zip_file_path)
    
    print(f"\n--- API 요청 수신: {filename} 처리 시작 ---")
    
    try:
        # 통합 파싱 및 선별 로직 실행
        ranked_results = run_integrated_parsing(zip_file_path, new_job_description)
        
        # [JSON 출력 확인 코드]
        import json
        print("\n--- [API RESPONSE BODY] 최종 JSON 데이터 미리보기 (상위 1개) ---")
        if ranked_results:
            # ensure_ascii=False 옵션으로 한글이 깨지지 않고 출력
            print(json.dumps(ranked_results[0], indent=4, ensure_ascii=False)) 
        else:
            print("데이터 없음")

        # 결과 반환
        return jsonify({
            "status": "SUCCESS",
            "count": len(ranked_results),
            "data": ranked_results
        }), 200

    except Exception as e:
        if os.path.exists(zip_file_path):
            os.remove(zip_file_path)
        shutil.rmtree("temp_resumes", ignore_errors=True)
        print(f"FATAL ERROR during processing: {e}")
        return jsonify({"status": "FATAL_ERROR", "message": str(e)}), 500

    finally:
        # 처리 완료 후 임시 저장된 ZIP 파일 삭제
        if os.path.exists(zip_file_path):
            os.remove(zip_file_path)

# --------------------------------------------------------------------------
# --- [4] 서버 실행 ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)