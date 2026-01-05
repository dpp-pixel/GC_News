import { useNavigate } from "react-router-dom";
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

      <div className={styles.tagsRow}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <p className={styles.desc}>
        정치/사회 섹션에서 정책 기사를 중심으로 취재하고 있습니다.
      </p>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.primaryButton}>
          + 구독
        </button>
        <button type="button" className={styles.secondaryButton}>
          추천
        </button>
      </div>

      <div className={styles.emailBox}>{email}</div>

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
          작성한 기사 확인
        </button>
        <button type="button" className={styles.fullWidthButton}>
          날짜 입력
        </button>
      </div>
    </div>
  );
}
