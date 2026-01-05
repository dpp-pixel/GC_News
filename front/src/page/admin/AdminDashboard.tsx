// src/page/admin/AdminDashboard.tsx
import { useState } from "react";
import styles from "./AdminDashboard.module.css";
import AdminSummaryCard from "./AdminSummaryCard";

const TABS = ["홈", "유저", "댓글", "기사", "기자"];

const CARDS = [
  { id: 1, badge: "메인 뉴스", badgeTone: "main" as const },
  { id: 2, badge: "정치" },
  { id: 3, badge: "경제" },
  { id: 4, badge: "사회" },
  { id: 5, badge: "생활/문화" },
  { id: 6, badge: "세계" },
  { id: 7, badge: "IT/과학" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("홈");

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ===== 상단 관리자 탭 ===== */}
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

        {/* ===== 세로 카드 리스트 ===== */}
        <section className={styles.cardList}>
          {CARDS.map((card, index) => (
            <div key={card.id} className={styles.cardBlock}>
              <AdminSummaryCard
                badge={card.badge}
                badgeTone={card.badgeTone as "main" | undefined}
              />
              {/* 🔹 마지막 카드가 아니면 회색 구분선 표시 */}
              {index < CARDS.length - 1 && (
                <div className={styles.cardDivider} />
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
