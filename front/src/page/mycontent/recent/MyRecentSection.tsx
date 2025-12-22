import { useEffect, useState } from "react";
import axios from "axios";
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
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/users/me/view-history"
        );
        setRecentArticles(res.data);
      } catch (e) {
        console.error("최근 본 기사 로딩 실패:", e);
        setError("최근 본 기사 로딩에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p>최근 본 기사 불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="bookmark-layout recent-layout">
      <section className="bookmark-main recent-main">
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
