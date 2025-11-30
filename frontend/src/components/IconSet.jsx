// icons 모음
import React from 'react';

// SVG 파일을 React 컴포넌트로 가져옵니다.
// CRA(Create React App)는 SVG를 ReactComponent로 가져오는 것을 지원합니다.
import { ReactComponent as FilterSvg } from '../assets/icons/filter.svg';
import { ReactComponent as PlusSvg } from '../assets/icons/plus.svg';
import { ReactComponent as FileSvg } from '../assets/icons/file.svg';
import { ReactComponent as XSvg } from '../assets/icons/x.svg';
import { ReactComponent as AnalysisSvg } from '../assets/icons/analysis.svg';
import { ReactComponent as UserSvg } from '../assets/icons/user.svg';
import { ReactComponent as ArchiveSvg } from '../assets/icons/archive.svg';
import { ReactComponent as SendSvg } from '../assets/icons/send.svg';
import { ReactComponent as ArrowSvg } from '../assets/icons/arrow.svg';
import { ReactComponent as CircleSvg } from '../assets/icons/Circle.svg';



/**
 * 필터 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const FilterIcon = (props) => {
  return <FilterSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const PlusIcon = (props) => {
  return <PlusSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const FileIcon = (props) => {
  return <FileSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const XIcon = (props) => {
  return <XSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const AnalysisIcon = (props) => {
  return <AnalysisSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const UserIcon = (props) => {
  return <UserSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const ArchiveIcon = (props) => {
  return <ArchiveSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const SendIcon = (props) => {
  return <SendSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const CircleIcon = (props) => {
  return <CircleSvg {...props} />;
};

/**
 * 플러스 아이콘 SVG를 React 컴포넌트로 래핑합니다.
 * @param {object} props - SVG에 전달할 props (예: className)
 */
export const ArrowIcon = (props) => {
  return <ArrowSvg {...props} />;
};
