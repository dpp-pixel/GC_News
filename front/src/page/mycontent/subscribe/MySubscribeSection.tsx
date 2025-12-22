// src/page/mycontent/subscribe/MySubscribeSection.tsx
import { useState } from "react";
import ReporterCard, {
  type ReporterInfo,
} from "../../../components/reporter/ReporterCard";
import "./MySubscribeSection.css";

/* ===== 더미 데이터 (슬라이더 테스트용, 반드시 10개 이상) ===== */
const MOCK_REPORTERS: ReporterInfo[] = Array.from(
  { length: 10 },
  (_, i) => ({
    id: i + 1,
    name: `기자${i + 1}`,
    email: `reporter${i + 1}@news.com`,
    subscribers: 80 + i * 5,
    recommends: 3 + i * 2,
    tags: ["정치부", "분석"],
    trustScore: 70 + i,
    imageUrl: `https://picsum.photos/150?random=${i + 1}`,
  })
);

const CARD_WIDTH = 360;
const CARD_GAP = 24;
const MOVE_UNIT = CARD_WIDTH + CARD_GAP;

export default function MySubscribeSection() {
  const [index, setIndex] = useState(0);

  const maxIndex = MOCK_REPORTERS.length - 1;

  const handlePrev = () => {
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) =>
      Math.min(maxIndex, prev + 1)
    );
  };

  return (
    <div className="reporter-slider">
      {/* 왼쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${index === 0 ? "disabled" : ""}`}
        onClick={handlePrev}
      >
        &#60;
      </button>

      {/* ===== 카드 뷰포트 ===== */}
      <div className="card-viewport">
        <div
          className="card-track"
          style={{
            transform: `translateX(-${index * MOVE_UNIT}px)`,
          }}
        >
          {MOCK_REPORTERS.map((reporter) => (
            <ReporterCard
              key={reporter.id}
              info={reporter}
            />
          ))}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${
          index >= maxIndex ? "disabled" : ""
        }`}
        onClick={handleNext}
      >
        &#62;
      </button>
    </div>
  );
}
