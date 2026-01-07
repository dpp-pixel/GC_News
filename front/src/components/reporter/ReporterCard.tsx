import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/api/client";
import styles from "./ReporterCard.module.css";



// MyContentsPage 등에서 같이 쓸 수 있게 export

export interface ReporterInfo {
  id: number;
  name: string;
  email: string;
  subscribers: number;
  recommends: number;
  tags: string[];
  trustScore: number; // 0 ~ 100
  imageUrl: string;
}

export default function ReporterCard({
  info,
  showTrustAnalysis = true
}: {
  info: ReporterInfo;
  showTrustAnalysis?: boolean;
}) {
  const navigate = useNavigate();

  const {
    id,
    name,
    subscribers: initialSubscribers,
    recommends: initialRecommends,
    trustScore,
    imageUrl,
  } = info;

  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [recommends, setRecommends] = useState(initialRecommends);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [currentTrustScore, setCurrentTrustScore] = useState(trustScore);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const clampedScore = Math.max(0, Math.min(100, currentTrustScore));

  // 컴포넌트 마운트 시 구독/추천 상태 확인
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [subRes, recRes] = await Promise.all([
          api.get(`/reporters/${id}/is-subscribed`),
          api.get(`/reporters/${id}/is-recommended`)
        ]);
        setIsSubscribed(subRes.data.isSubscribed);
        setIsRecommended(recRes.data.isRecommended);
      } catch (e) {
        console.error("상태 조회 실패:", e);
      }
    };
    fetchStatus();
  }, [id]);

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await api.post(`/reporters/${id}/unsubscribe`);
        setSubscribers((prev) => prev - 1);
        setIsSubscribed(false);
      } else {
        await api.post(`/reporters/${id}/subscribe`);
        setSubscribers((prev) => prev + 1);
        setIsSubscribed(true);
      }
    } catch (e: any) {
      console.error("구독 처리 실패:", e);
      console.error("에러 응답:", e.response?.data);
      alert(`구독 처리 실패: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleRecommend = async () => {
    try {
      if (isRecommended) {
        await api.post(`/reporters/${id}/unrecommend`);
        setRecommends((prev) => prev - 1);
        setIsRecommended(false);
      } else {
        await api.post(`/reporters/${id}/recommend`);
        setRecommends((prev) => prev + 1);
        setIsRecommended(true);
      }
    } catch (e: any) {
      console.error("추천 처리 실패:", e);
      console.error("에러 응답:", e.response?.data);
      alert(`추천 처리 실패: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleTrustAnalysis = async () => {
    if (isAnalyzing) return;

    const confirmed = window.confirm(
      `${name} 기자의 최근 기사를 분석하여 신뢰도를 평가합니다.\n` +
      `분석에는 수 분이 소요될 수 있습니다.\n` +
      `계속하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      setIsAnalyzing(true);
      const response = await api.post(`/reporters/${id}/analyze-trust`);
      const data = response.data;

      setCurrentTrustScore(data.trustScore);
      alert(
        `신뢰도 분석이 완료되었습니다!\n` +
        `분석된 기사: ${data.analyzedCount}개\n` +
        `신뢰도 점수: ${Math.round(data.trustScore)}점`
      );
    } catch (e: any) {
      console.error("신뢰도 분석 실패:", e);
      alert(`신뢰도 분석 실패: ${e.response?.data?.message || e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* 프로필 이미지 */}
      <div
        className={styles.avatarWrapper}
        onClick={() => navigate(`/reporter/${id}`)}
      >
        <img src={imageUrl} alt={`${name} 기자`} className={styles.avatar} />
      </div>

      {/* 이름 */}
      <div
        className={styles.name}
        onClick={() => navigate(`/reporter/${id}`)}
      >
        {name} 기자
      </div>

      {/* 구독 / 추천 통계 */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{subscribers}</div>
          <div className={styles.statLabel}>구독</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{recommends}</div>
          <div className={styles.statLabel}>추천</div>
        </div>
      </div>

      {/* 인사말 */}
      <div className={styles.greeting}>
        안녕하세요. {name} 기자입니다.
      </div>

      {/* 구독 / 추천 버튼 */}
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={`${styles.actionButton} ${isSubscribed ? styles.subscribed : ""}`}
          onClick={handleSubscribe}
        >
          <span className={styles.buttonIcon}>{isSubscribed ? "✓" : "+"}</span>
          <span>{isSubscribed ? "구독중" : "구독"}</span>
        </button>
        <button
          type="button"
          className={`${styles.actionButton} ${isRecommended ? styles.recommended : ""}`}
          onClick={handleRecommend}
        >
          <span className={styles.buttonIcon}>{isRecommended ? "✓" : "+"}</span>
          <span>{isRecommended ? "추천중" : "추천"}</span>
        </button>
      </div>

      {/* 신뢰도 섹션 */}
      <div className={styles.trustSection}>
        <div className={styles.trustHeader}>
          <span>기자 신뢰도</span>
        </div>

        <div className={styles.trustBarWrapper}>
          <div className={styles.trustBarTrack}>
            <div
              className={styles.trustBarFill}
              style={{ width: `${clampedScore}%` }}
            />
          </div>
          <span className={styles.trustLabel}>{clampedScore}%</span>
        </div>
      </div>

      {/* 신뢰도 분석 버튼 */}
      {showTrustAnalysis && (
        <button
          type="button"
          className={styles.analyzeButton}
          onClick={handleTrustAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "분석 중..." : "신뢰도 분석"}
        </button>
      )}
    </div>
  );
}
