import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { requireLogin } from "@/auth/auth";
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
  const [showTooltip, setShowTooltip] = useState(false);

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
    if (!requireLogin(navigate)) {
      return;
    }

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
    if (!requireLogin(navigate)) {
      return;
    }

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
    if (!requireLogin(navigate)) {
      return;
    }

    if (isAnalyzing) return;

    const confirmed = window.confirm(
      `${name} 기자의 최근 기사를 분석하여 신뢰도를 평가합니다.\n` +
      `분석에는 시간이 소요될 수 있습니다.\n` +
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
          <div className={styles.infoButtonWrapper}>
            <button
              type="button"
              className={styles.infoButton}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              ?
            </button>

            {/* 툴팁 */}
            {showTooltip && (
              <div className={styles.tooltip}>
                <div className={styles.tooltipContent}>
              <h4>⚠️ 평가 원칙</h4>
              <p>1. 우수한 저널리즘 기준으로 평가 (평범한 기사 = 평범한 점수)</p>
              <p>2. 각 항목 최고점은 완벽한 경우에만 부여</p>
              <p>3. 문제점 발견 시 즉시 감점</p>

              <h4>평가 배점 (총 100점) - 내용 중심 평가</h4>

              <h5>Part A. 제목-본문 정합성 (40점)</h5>
              <p><strong>키워드 일치도 (10점)</strong></p>
              <ul>
                <li>제목의 모든 키워드가 본문에 명확히 등장: 10점</li>
                <li>대부분 일치하나 일부 불명확: 7점</li>
                <li>절반 정도 일치: 5점</li>
                <li>일치도 낮음: 3점</li>
              </ul>

              <p><strong>주제 반영도 (10점)</strong></p>
              <ul>
                <li>본문 핵심이 제목에 정확히 요약됨: 10점</li>
                <li>주요 내용 반영되나 부차적 내용 강조: 7점</li>
                <li>부분적으로만 반영: 5점</li>
                <li>제목과 본문 초점 불일치: 3점</li>
              </ul>

              <p><strong>과장/왜곡 여부 (20점)</strong></p>
              <ul>
                <li>사실 그대로 전달, 완전 중립적: 20점</li>
                <li>약간의 강조 표현: 16점</li>
                <li>경미한 과장 (범위→단일값 등): 12점</li>
                <li>선정적/모호한 표현: 8점</li>
                <li>명백한 오도/클릭베이트: 0-4점</li>
              </ul>

              <h5>Part B. 내용 구성 품질 (60점)</h5>
              <p><strong>사실/의견 구분 명확성 (35점)</strong></p>
              <p>※ 사실: 검증 가능한 객관적 정보 / 의견: 주장, 추측, 감정 표현</p>
              <ul>
                <li>사실 60% 이상 + 출처 명확: 35점</li>
                <li>사실 45-59% + 출처 대부분 명확: 28점</li>
                <li>사실 30-44% 또는 출처 일부 불명확: 20점</li>
                <li>사실 30% 미만 또는 사실/의견 혼재: 12점</li>
                <li>대부분 의견이나 추측: 5점</li>
              </ul>

              <p><strong>내용 균형성 (25점)</strong></p>
              <p>※ 5개 요소: 사실/수치/주장/배경/분석</p>
              <ul>
                <li>5개 요소 모두 충실히 포함: 25점</li>
                <li>4개 요소 포함: 20점</li>
                <li>3개 요소 포함: 15점</li>
                <li>2개 요소: 10점</li>
                <li>1개 이하: 5점</li>
              </ul>

              <h4>세부 분석 항목</h4>
              <p>1. 사실 (Facts): 공식 발표, 실명 인용, 검증 가능한 데이터</p>
              <p>2. 수치 (Numbers): 출처가 명확한 구체적 숫자</p>
              <p>3. 주장 (Claims): 의견, 추측, 익명 인용, 감정 표현</p>
              <p>4. 배경설명 (Context): 과거 경위, 관련 정보</p>
              <p>5. 분석 (Analysis): 전문가 실명 견해, 근거 있는 인과관계</p>

              <h4>점수 해석 가이드</h4>
              <ul>
                <li>75점 이상: 우수한 기사</li>
                <li>60-74점: 평균적 기사</li>
                <li>45-59점: 미흡한 기사</li>
                <li>45점 미만: 저품질 기사</li>
              </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.trustBarWrapper}>
          <div className={styles.trustBarTrack}>
            <div
              className={styles.trustBarFill}
              style={{ width: `${clampedScore}%` }}
            />
          </div>
          <span className={styles.trustLabel}>
            {clampedScore === 0 ? '?%' : `${clampedScore.toFixed(1)}%`}
          </span>
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
