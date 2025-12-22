// src/page/mycontent/subscribe/MySubscribeSection.tsx
import { useState } from "react";
import ReporterCard, {
  type ReporterInfo,
} from "../../../components/reporter/ReporterCard";
import "./MySubscribeSection.css";

/* 더미 데이터 */
const MOCK_REPORTERS: ReporterInfo[] = [
  {
    id: 1,
    name: "김대기",
    email: "watingkim@donga.com",
    subscribers: 100,
    recommends: 3,
    tags: ["정치부", "정직한", "솔직한"],
    trustScore: 80,
    imageUrl: "",
  },
  {
    id: 2,
    name: "김장철",
    email: "kimchiseason@news.com",
    subscribers: 95,
    recommends: 12,
    tags: ["경제", "침착한"],
    trustScore: 78,
    imageUrl: "",
  },
  {
    id: 3,
    name: "이서연",
    email: "seoyeon@press.co.kr",
    subscribers: 140,
    recommends: 23,
    tags: ["사회", "깊이있는"],
    trustScore: 82,
    imageUrl: "",
  },
  {
    id: 4,
    name: "박민수",
    email: "minsu@media.com",
    subscribers: 88,
    recommends: 9,
    tags: ["국방", "분석력 좋은"],
    trustScore: 76,
    imageUrl: "",
  },
  {
    id: 5,
    name: "한성태",
    email: "hansung@news.com",
    subscribers: 120,
    recommends: 35,
    tags: ["정치부", "차분한"],
    trustScore: 80,
    imageUrl: "",
  },
];

const VISIBLE_COUNT = 4;

export default function MySubscribeSection() {
  const [startIndex, setStartIndex] = useState(0);

  const canGoPrev = startIndex > 0;
  const canGoNext =
    startIndex + VISIBLE_COUNT < MOCK_REPORTERS.length;

  const visibleReporters = MOCK_REPORTERS.slice(
    startIndex,
    startIndex + VISIBLE_COUNT
  );

  const handlePrev = () => {
    if (!canGoPrev) return;
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setStartIndex((prev) =>
      Math.min(
        MOCK_REPORTERS.length - VISIBLE_COUNT,
        prev + 1
      )
    );
  };

  return (
    <div className="reporter-slider">
      <button
        type="button"
        className={`arrow left ${
          canGoPrev ? "" : "disabled"
        }`}
        onClick={handlePrev}
        disabled={!canGoPrev}
      >
        &#60;
      </button>

      <div className="card-track">
        {visibleReporters.map((reporter) => (
          <ReporterCard key={reporter.id} info={reporter} />
        ))}
      </div>

      <button
        type="button"
        className={`arrow right ${
          canGoNext ? "" : "disabled"
        }`}
        onClick={handleNext}
        disabled={!canGoNext}
      >
        &#62;
      </button>
    </div>
  );
}
