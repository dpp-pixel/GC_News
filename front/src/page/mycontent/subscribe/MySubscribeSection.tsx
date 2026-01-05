// src/page/mycontent/subscribe/MySubscribeSection.tsx
import { useEffect, useRef, useState } from "react";
import ReporterCard, {
  type ReporterInfo,
} from "../../../components/reporter/ReporterCard";
import "./MySubscribeSection.css";

// 더미 데이터
const MOCK_REPORTERS: ReporterInfo[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: i + 1,
    name: `김기덕${i + 1}`,
    email: `reporter${i + 1}@news.com`,
    subscribers: 80 + i * 5,
    recommends: 3 + i * 2,
    tags: ["정치부", "분석"],
    trustScore: 70 + i,
    imageUrl: "https://picsum.photos/150",
  })
);

// 기본 설정값
const GAP = 24;           // 카드 사이 간격(px)
const VISIBLE_COUNT = 4;  // 한 화면에 보이는 카드 개수

export default function MySubscribeSection() {
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // 뷰포트 실제 너비를 기준으로 카드 하나의 너비를 계산
  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return;

      const viewportWidth = viewportRef.current.offsetWidth;
      const totalGap = GAP * (VISIBLE_COUNT - 1);
      const widthPerCard = (viewportWidth - totalGap) / VISIBLE_COUNT;

      setCardWidth(widthPerCard);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const maxIndex = Math.max(0, MOCK_REPORTERS.length - VISIBLE_COUNT);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  // 카드 하나 이동할 때의 이동량 = 카드 폭 + 간격
  const step = cardWidth + GAP;
  const translateX = index * step;

  return (
    <div className="slider-wrapper">
      {/* 왼쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${!canPrev ? "disabled" : ""}`}
        onClick={() => canPrev && setIndex(index - 1)}
        disabled={!canPrev}
      >
        ‹
      </button>

      {/* 보이는 뷰포트 */}
      <div className="card-viewport" ref={viewportRef}>
        <div
          className="card-track"
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {MOCK_REPORTERS.map((info) => (
            <div
              key={info.id}
              className="card-item"
              style={{ width: cardWidth || undefined }}
            >
              {/* 카드 크기는 ReporterCard.module.css에서 조절 */}
              <ReporterCard info={info} />
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${!canNext ? "disabled" : ""}`}
        onClick={() => canNext && setIndex(index + 1)}
        disabled={!canNext}
      >
        ›
      </button>
    </div>
  );
}
