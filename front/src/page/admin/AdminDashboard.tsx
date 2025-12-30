import { useState } from "react";
import styles from "./AdminDashboard.module.css";

const TABS = ["홈", "유저", "댓글", "기사", "기자"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("홈");

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ===== 상단 관리자용 카테고리바 ===== */}
        <header className={styles.adminNav}>
          <nav className={styles.tabList}>
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tab} ${
                  activeTab === tab ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className={styles.tabUnderline} />
        </header>

        {/* ===== 카드 2×2 레이아웃 ===== */}
        <section className={styles.grid}>
          {/* 1행 */}
          <div className={styles.row}>
            <AdminCard badge="메인 뉴스" badgeTone="main" />
            <AdminCard badge="정치" />
          </div>

          {/* 중간 회색 선 */}
          <div className={styles.rowDivider} />

          {/* 2행 */}
          <div className={styles.row}>
            <AdminCard badge="경제" />
            <AdminCard badge="사회" />
          </div>
        </section>
      </div>
    </div>
  );
}

/** 카드 하나 재사용용 컴포넌트 */
type CardProps = {
  badge: string;
  badgeTone?: "main";
};

function AdminCard({ badge, badgeTone }: CardProps) {
  return (
    <article className={styles.card}>
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
