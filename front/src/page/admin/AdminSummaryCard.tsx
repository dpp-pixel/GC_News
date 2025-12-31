// src/components/admin/AdminSummaryCard.tsx
import styles from "../../page/admin/AdminDashboard.module.css";

export type AdminSummaryCardProps = {
  /** 오른쪽 상단 뱃지 텍스트 (예: "메인 뉴스", "정치") */
  badge: string;
  /** 메인 뉴스 카드만 강조하고 싶을 때 "main" */
  badgeTone?: "main";
};

export default function AdminSummaryCard({
  badge,
  badgeTone,
}: AdminSummaryCardProps) {
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
        <div className={styles.articleTitle}>기사 제목</div>
        <ul className={styles.summaryList}>
          <li>(AI가 요약해주는 내용)</li>
          <li>(AI가 요약해주는 내용)</li>
        </ul>
      </div>
    </article>
  );
}
