// src/components/reporter/repoterpage/ReporterSidebar.tsx
import styles from "./ReporterSidebar.module.css";

interface Field {
  label: string;
  value: number;
}

interface Reporter {
  name: string;
  department: string;
  email: string;
  subscribers: number;
  recommends: number;
  fields: Field[];
}

interface Props {
  reporter: Reporter;
}

export default function ReporterSidebar({ reporter }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar} />
        <h2>{reporter.name}</h2>
        <p className={styles.department}>{reporter.department}</p>

        <div className={styles.stats}>
          <span>구독 {reporter.subscribers}</span>
          <span>추천 {reporter.recommends}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.subscribe}>+ 구독</button>
          <button className={styles.recommend}>추천</button>
        </div>

        <div className={styles.email}>{reporter.email}</div>
      </div>

      <div className={styles.coverage}>
        <h3>취재분야</h3>
        {reporter.fields.map((field) => (
          <div key={field.label} className={styles.field}>
            <span>{field.label}</span>
            <span>{field.value}%</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
