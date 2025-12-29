// src/components/common/Loading/Loading.tsx

import "./Loading.css";

interface LoadingProps {
  text?: string;
}

export default function Loading({
  text = "최신 기사 불러오는 중",
}: LoadingProps) {
  return (
    <div className="loading-container">
      <span className="loading-text">{text}</span>
      <span className="loading-dots">
        <span className="dot dot1">.</span>
        <span className="dot dot2">.</span>
        <span className="dot dot3">.</span>
      </span>
    </div>
  );
}
