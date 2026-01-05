// src/page/mycontent/recent/MyRecentSection.tsx
import { useEffect, useState } from "react";
import apiClient from "@/auth/apiClient"; // JWT 포함 Axios
import { useNavigate } from "react-router-dom";
import { Loading } from "@/components";
import "./MyRecentSection.css";

interface Media {
  url: string;
  mediaType: string;
}

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  urlString: string;
  mediaList?: Media[];
}

export default function MyRecentSection() {
  const DAYS = 3;
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleClickArticle = (articleId: number) => {
    navigate(`/news/${articleId}`);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      console.log("Fetching recent articles...");
      try {
        const res = await apiClient.get<Article[]>("/api/users/me/view-history", {
          params: { days: DAYS },
        });
        console.log("Recent articles response:", res.data);

        if (!res.data || res.data.length === 0) {
          setRecentArticles([]);
        } else {
          setRecentArticles(res.data);
        }
      } catch (e: any) {
        console.error(
          "최근 본 기사 로딩 실패:",
          e?.response?.status,
          e?.response?.data
        );
        if (e?.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          setError("최근 본 기사 로딩에 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <Loading text="최신 기사 불러오는 중" />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="bookmark-layout recent-layout">
      <section className="bookmark-main recent-main">
        <div className="recent-title">최근 {DAYS}일간의 기사입니다</div>
        {recentArticles.length === 0 && (
          <div>최근 본 기사가 없습니다.</div>
        )}

        <ul className="bookmark-list">
          {recentArticles.map((article) => (
            <li
          key={article.articleId}
          className="bookmark-item"
          onClick={() => handleClickArticle(article.articleId)}
          style={{ cursor: "pointer" }}
        >
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
