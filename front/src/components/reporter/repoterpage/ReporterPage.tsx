// src/components/reporter/repoterpage/ReporterPage.tsx
import { useParams } from "react-router-dom";
import ReporterSidebar from "./ReporterSidebar";
import ReporterArticleSection from "./ReporterArticleSection";
import styles from "./ReporterPage.module.css";

export default function ReporterPage() {
  const { reporterId } = useParams<{ reporterId: string }>();

  const reporter = {
    id: reporterId,
    name: "이채완 기자",
    department: "동아일보 정치부",
    email: "chaewani@donga.com",
    subscribers: 86,
    recommends: 8,
    fields: [
      { label: "정당", value: 41 },
      { label: "정치일반", value: 22 },
      { label: "대통령", value: 11 },
    ],
  };

  return (
    <div className={styles.page}>
  <ReporterSidebar reporter={reporter} />

  <div>
    
    <ReporterArticleSection />
  </div>
</div>
  );
}
