// front/src/page/mycontent/recent/MyRecentSection.tsx
import { useEffect, useState } from "react";
import { api } from "../../../api/client"; // client.ts 경로 반영
import apiClient from "@/auth/apiClient";   // ✅ 공통 클라이언트
import { Loading } from "@/components";
import "./MyRecentSection.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  urlString: string;
  mediaList?: { url: string; mediaType: string }[];
}

export default function MyRecentSection() {
  const DAYS = 3;
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get<Article[]>("/users/me/view-history", {
          params: { days: DAYS },
        });
        setRecentArticles(res.data);
      } catch (e: any) {
        console.error(
          "최근 본 기사 로딩 실패:",
          e?.response?.status,
          e?.response?.data
        );
        setError("최근 본 기사 로딩에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 로딩 상태
  if (loading) {
    return <Loading text="최신 기사 불러오는 중" />;
  }

  // 에러 상태
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="bookmark-layout recent-layout">
      <section className="bookmark-main recent-main">
        <div className="recent-title">최근 {DAYS}일간의 기사입니다</div>
        {recentArticles.length === 0 && <div>최근 본 기사가 없습니다.</div>}

        <ul className="bookmark-list">
          {recentArticles.map((article) => (
            <li key={article.articleId} className="bookmark-item">
              <div className="bookmark-thumb">
                {article.mediaList?.[0]?.url ? (
                  <img src={article.mediaList[0].url} alt={article.title} />
                ) : (
                  <div className="no-image-box">이미지 없음</div>
                )}
              </div>
              <div className="bookmark-info">
                <div className="bookmark-title">{article.title}</div>
                <div className="bookmark-meta">
                  <span>{article.press}</span> ·{" "}
                  {new Date(article.publishedAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
