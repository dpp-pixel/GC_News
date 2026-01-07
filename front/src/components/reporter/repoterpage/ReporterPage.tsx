// src/components/reporter/repoterpage/ReporterPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import ReporterCard, { type ReporterInfo } from "../ReporterCard";
import ReporterArticleSection from "./ReporterArticleSection";
import styles from "./ReporterPage.module.css";

export default function ReporterPage() {
  const { reporterId } = useParams<{ reporterId: string }>();
  const [reporterInfo, setReporterInfo] = useState<ReporterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReporter = async () => {
      if (!reporterId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/reporters/${reporterId}`);
        const reporter = res.data.reporter;

        // 백엔드 응답을 프론트엔드 형식에 맞게 매핑
        setReporterInfo({
          id: reporter.reporterId,
          name: reporter.name,
          email: reporter.email || "",
          subscribers: reporter.subscriberCount || 0,
          recommends: reporter.recommendationCount || 0,
          tags: [],
          trustScore: reporter.trustScore || 0,
          imageUrl: reporter.profileImageUrl || "https://picsum.photos/150",
        });
      } catch (e) {
        console.error("기자 정보 조회 실패:", e);
        setError("기자 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReporter();
  }, [reporterId]);

  if (loading) return <div>기자 정보 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!reporterInfo) return <div>기자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.page}>
      <ReporterCard info={reporterInfo} />

      <div>
        <ReporterArticleSection />
      </div>
    </div>
  );
}
