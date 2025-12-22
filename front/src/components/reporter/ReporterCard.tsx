// src/components/reporter/ReporterCard.tsx
import styles from "./ReporterCard.module.css";

export interface ReporterInfo {
  id: number;
  name: string;
  email: string;
  subscribers: number;
  recommends: number;
  tags: string[];
  trustScore: number;
  imageUrl: string;
}

export default function ReporterCard({ info }: { info: ReporterInfo }) {
  const {
    name,
    email,
    subscribers,
    recommends,
    tags,
    trustScore,
    imageUrl,
  } = info;

  const clampedScore = Math.max(0, Math.min(100, trustScore));

  return (
    <div className={styles.card}>
      {/* ===== 상단 프로필 ===== */}
      <div className={styles.profile}>
        <img
          src={imageUrl}
          alt={`${name} 기자`}
          className={styles.avatar}
        />
        <div className={styles.name}>{name} 기자</div>
        <div className={styles.position}>정치부 열혈기자</div>
      </div>

      <div className={styles.horizontalLine} />

      {/* ===== 구독 / 추천 요약 ===== */}
      <div className={styles.summaryRow}>
        <span>구독 {subscribers}</span>
        <span className={styles.separator}>|</span>
        <span>추천 {recommends}</span>
      </div>

      {/* ===== 태그 ===== */}
      <div className={styles.tagsRow}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      {/* ===== 액션 영역 ===== */}
      <div className={styles.actionSection}>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.primaryButton}>
            + 구독
          </button>
          <button type="button" className={styles.secondaryButton}>
            추천
          </button>
        </div>

        <div className={styles.emailBox}>{email}</div>
      </div>

      {/* ===== 신뢰도 ===== */}
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

      {/* ===== 하단 버튼 ===== */}
      <div className={styles.bottomButtons}>
        <button type="button" className={styles.fullWidthButton}>
          작성한 기사 확인
        </button>
        <button type="button" className={styles.fullWidthButton}>
          날짜 입력
        </button>
      </div>
    </div>
  );
}
