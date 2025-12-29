// src/page/mycontent/subscribe/MySubscribeSection.tsx
import { useState } from "react";
import ReporterCard, {
  type ReporterInfo,
} from "../../../components/reporter/ReporterCard";
import "./MySubscribeSection.css";

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

const CARD_WIDTH = 360;
const GAP = 24;
const VISIBLE_COUNT = 5;

export default function MySubscribeSection() {
  const [index, setIndex] = useState(0);

  const maxIndex = MOCK_REPORTERS.length - VISIBLE_COUNT;

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const translateX = index * (CARD_WIDTH + GAP);

  return (
    <div className="slider-wrapper">
      <button
        className={`arrow ${!canPrev ? "disabled" : ""}`}
        onClick={() => canPrev && setIndex(index - 1)}
      >
        ‹
      </button>

      <div className="card-viewport">
        <div
          className="card-track"
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {MOCK_REPORTERS.map((info) => (
            <ReporterCard key={info.id} info={info} />
          ))}
        </div>
      </div>

      <button
        className={`arrow ${!canNext ? "disabled" : ""}`}
        onClick={() => canNext && setIndex(index + 1)}
      >
        ›
      </button>
    </div>
  );
}
