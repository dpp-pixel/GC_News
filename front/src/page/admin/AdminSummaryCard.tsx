// src/components/admin/AdminSummaryCard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../page/admin/AdminDashboard.module.css";

export type AdminSummaryCardProps = {
  /** 오른쪽 상단 뱃지 텍스트 (예: "메인 뉴스", "정치") */
  badge: string;
  /** 메인 뉴스 카드만 강조하고 싶을 때 "main" */
  badgeTone?: "main";
  /** 테마별 요약을 위한 themeId (없으면 전체 헤드라인 요약) */
  themeId?: number;
};

interface Summary {
  summaryId: number;
  targetType: string;
  targetId: number;
  summaryText: string;
  createdAt: string;
  score: number | null;
}

export default function AdminSummaryCard({
  badge,
  badgeTone,
  themeId,
}: AdminSummaryCardProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        let url: string;
        if (themeId) {
          // 테마별 요약
          url = `http://localhost:8081/api/articles/theme-headline-summary?themeId=${themeId}`;
        } else {
          // 전체 헤드라인 요약
          url = "http://localhost:8081/api/articles/headline-summary";
        }

        const res = await axios.get<Summary>(url);
        setSummary(res.data);
      } catch (e) {
        console.error("요약 조회 실패:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [themeId]);

  return (
    <article className={styles.card}>
      {/* 상단 - AI 요약 / 뱃지 */}
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <span className={styles.cardLabel}>AI 요약</span>
        </div>
        <span
          className={`${styles.badge} ${
            badgeTone === "main" ? styles.badgeMain : ""
          }`}
        >
          {badge}
        </span>
      </header>

      {/* 본문 영역 */}
      <div className={styles.cardBody}>
        {loading && <p>요약을 불러오는 중...</p>}
        {error && <p>요약을 불러오는데 실패했습니다.</p>}
        {!loading && !error && summary && (
          <>
            <div className={styles.articleTitle}>
              {themeId ? `${badge} 분야 주요 뉴스 흐름` : "오늘의 주요 뉴스 흐름"}
            </div>
            <div className={styles.summaryText}>
              {summary.summaryText}
            </div>
          </>
        )}
        {!loading && !error && !summary && (
          <p>요약 정보가 없습니다.</p>
        )}
      </div>
    </article>
  );
}
