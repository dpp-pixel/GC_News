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

export default function ReporterCard({ info }: { info: ReporterInfo }) {
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

  const clampedScore = Math.max(0, Math.min(100, trustScore));

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

  return (
    <div className={styles.card}>
      <div className={styles.profile}>
        <img src={imageUrl} alt={`${name} 기자`} className={styles.avatar} />

        <div
          className={styles.name}
          onClick={() => navigate(`/reporter/${id}`)}
        >
          {name} 기자
        </div>

        <div className={styles.position}>정치부 열혈기자</div>
      </div>

      <div className={styles.horizontalLine} />

      <div className={styles.summaryRow}>
        <span>구독 {subscribers}</span>
        <span className={styles.separator}>|</span>
        <span>추천 {recommends}</span>
      </div>

      {/* <p className={styles.desc}>
        정치/사회 섹션에서 정책 기사를 중심으로 취재하고 있습니다.
      </p> */}

      <div className={styles.buttonRow}>
        <button type="button" className={styles.primaryButton} onClick={handleSubscribe}>
          {isSubscribed ? "구독 취소" : "+ 구독"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={handleRecommend}>
          {isRecommended ? "추천 취소" : "추천"}
        </button>
      </div>

      <div className={styles.trustSection}>
        <div className={styles.trustHeader}>
          <span>기자 신뢰도</span>
          <button type="button" className={styles.infoButton}>
            ?
          </button>
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

      <div className={styles.bottomButtons}>
        <button type="button" className={styles.fullWidthButton}>
          신뢰도 분석
        </button>
      </div>
    </div>
  );
}
