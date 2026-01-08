// src/page/mycontent/subscribe/MySubscribeSection.tsx
import { useEffect, useRef, useState } from "react";
import { api } from "@/api/client";
import { Loading } from "@/components";
import ReporterCard, {
  type ReporterInfo,
} from "../../../components/reporter/ReporterCard";
import "./MySubscribeSection.css";

// 기본 설정값
const GAP = 24;           // 카드 사이 간격(px)
const VISIBLE_COUNT = 4;  // 한 화면에 보이는 카드 개수

export default function MySubscribeSection() {
  const [reporters, setReporters] = useState<ReporterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // 구독한 기자 목록 가져오기
  useEffect(() => {
    const fetchSubscribedReporters = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/me/subscribed-reporters");
        const reporterData = res.data.map((reporter: any) => ({
          id: reporter.reporterId,
          name: reporter.name,
          email: reporter.email || "",
          subscribers: reporter.subscriberCount || 0,
          recommends: reporter.recommendationCount || 0,
          tags: [],
          trustScore: reporter.trustScore || 0,
          imageUrl: reporter.profileImageUrl || "https://picsum.photos/150",
        }));
        setReporters(reporterData);
      } catch (e) {
        console.error("구독 목록 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedReporters();
  }, []);

  // 뷰포트 실제 너비를 기준으로 카드 하나의 너비를 계산
  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return;

      const viewportWidth = viewportRef.current.offsetWidth;
      const totalGap = GAP * (VISIBLE_COUNT - 1);
      const widthPerCard = (viewportWidth - totalGap) / VISIBLE_COUNT;

      console.log('Viewport width:', viewportWidth);
      console.log('Total gap:', totalGap);
      console.log('Card width:', widthPerCard);

      setCardWidth(widthPerCard);
    };

    // 초기 렌더링 후 DOM이 완전히 로드된 후 계산
    const timer = setTimeout(updateSize, 0);

    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // 한 번에 이동할 카드 개수 (VISIBLE_COUNT만큼 이동)
  const SCROLL_STEP = VISIBLE_COUNT;

  const maxIndex = Math.max(0, reporters.length - VISIBLE_COUNT);
  const canPrev = index > 0;
  const canNext = index < reporters.length - VISIBLE_COUNT;

  // 카드 하나 이동할 때의 이동량 = 카드 폭 + 간격
  const step = cardWidth + GAP;
  const translateX = index * step;

  if (loading) return <Loading text="구독 목록을 불러오는 중" />;

  if (reporters.length === 0) {
    return <div>구독한 기자가 없습니다.</div>;
  }

  return (
    <div className="slider-wrapper">
      {/* 왼쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${!canPrev ? "disabled" : ""}`}
        onClick={() => canPrev && setIndex(Math.max(0, index - SCROLL_STEP))}
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
          {reporters.map((info) => (
            <div
              key={info.id}
              className="card-item"
              style={{ width: cardWidth || undefined }}
            >
              {/* 카드 크기는 ReporterCard.module.css에서 조절 */}
              <ReporterCard info={info} showTrustAnalysis={false} />
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <button
        type="button"
        className={`arrow ${!canNext ? "disabled" : ""}`}
        onClick={() => canNext && setIndex(Math.min(maxIndex, index + SCROLL_STEP))}
        disabled={!canNext}
      >
        ›
      </button>
    </div>
  );
}
