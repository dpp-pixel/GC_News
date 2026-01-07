import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { isLoggedIn } from "../../auth/auth";

interface Reporter {
  reporterId: number;
  name: string;
  profileImageUrl?: string | null;
  press: string;
  subscriberCount?: number;
  recommendationCount?: number;
}

interface ReporterAssetProps {
  reporter?: Reporter | null;
}

export default function ReporterAsset({ reporter }: ReporterAssetProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(reporter?.subscriberCount ?? 0);
  const [recommendationCount, setRecommendationCount] = useState(reporter?.recommendationCount ?? 0);

  if (!reporter) return null;

  // 구독 상태 조회
  useEffect(() => {
    if (!isLoggedIn() || !reporter) return;

    const checkSubscription = async () => {
      try {
        const res = await api.get<{ isSubscribed: boolean }>(
          `/reporters/${reporter.reporterId}/is-subscribed`
        );
        setIsSubscribed(res.data.isSubscribed);
      } catch (error) {
        console.error("구독 상태 조회 실패:", error);
      }
    };

    checkSubscription();
  }, [reporter]);

  // reporter 정보가 변경되면 카운트 업데이트
  useEffect(() => {
    setSubscriberCount(reporter.subscriberCount ?? 0);
    setRecommendationCount(reporter.recommendationCount ?? 0);
  }, [reporter.subscriberCount, reporter.recommendationCount]);

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isSubscribed) {
        await api.post(`/reporters/${reporter.reporterId}/unsubscribe`);
        setIsSubscribed(false);
        setSubscriberCount(prev => Math.max(0, prev - 1)); // 구독자 수 감소
      } else {
        await api.post(`/reporters/${reporter.reporterId}/subscribe`);
        setIsSubscribed(true);
        setSubscriberCount(prev => prev + 1); // 구독자 수 증가
      }
    } catch (error: any) {
      console.error("구독 처리 실패:", error);
      alert(error.response?.data?.message || "구독 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="reporter-asset-card"
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        textAlign: "center",
      }}
    >
      {/* 프로필 이미지 */}
      <Link
        to={`/reporter/${reporter.reporterId}`}
        style={{
          display: "inline-block",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#f3f3f3",
            margin: "0 auto 12px",
            border: "2px solid #e5e5e5",
          }}
        >
          {reporter.profileImageUrl ? (
            <img
              src={reporter.profileImageUrl}
              alt={`${reporter.name} 기자`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>

        {/* 이름 */}
        <div style={{ marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#000",
            }}
          >
            {reporter.name} 기자
          </span>
        </div>

        {/* 언론사 */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#666",
            }}
          >
            {reporter.press}
          </span>
        </div>
      </Link>

      {/* 구독 / 추천 통계 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "12px",
          paddingBottom: "12px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "2px" }}>
            {subscriberCount}
          </div>
          <div style={{ fontSize: "11px", color: "#999" }}>구독</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "2px" }}>
            {recommendationCount}
          </div>
          <div style={{ fontSize: "11px", color: "#999" }}>추천</div>
        </div>
      </div>

      {/* 인사말 */}
      <div
        style={{
          fontSize: "12px",
          color: "#666",
          lineHeight: "1.4",
          marginBottom: "12px",
          padding: "0 4px",
        }}
      >
        안녕하세요. {reporter.name} 기자입니다.
      </div>

      {/* 구독 버튼 */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "4px",
          border: isSubscribed ? "1px solid #999" : "1px solid #00c4cc",
          background: isSubscribed ? "#f5f5f5" : "#fff",
          color: isSubscribed ? "#999" : "#00c4cc",
          fontSize: "13px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSubscribed && !loading) {
            e.currentTarget.style.background = "#00c4cc";
            e.currentTarget.style.color = "#fff";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubscribed && !loading) {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#00c4cc";
          }
        }}
      >
        <span style={{ fontSize: "14px" }}>{isSubscribed ? "✓" : "+"}</span>
        <span>{loading ? "처리중..." : isSubscribed ? "구독중" : "구독"}</span>
      </button>
    </div>
  );
}