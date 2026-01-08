import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./HotIssueSection.css";

interface Article {
  articleId: number;
  title: string;
  urlString: string;
  press: string;
  viewCount: number;
  clusterCount: number;
  mediaList?: { url: string }[];
}

export default function HotIssueSection({ themeId }: { themeId: number }) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    axios
      .get<Article[]>("http://localhost:8081/api/articles/headline", {
        params: {
          days: 3,
          limit: 5,
          themeId,
        },
      })
      .then((res) => setArticles(res.data))
      .catch(console.error);
  }, [themeId]);

  if (articles.length === 0) return null;

  return (
    <section className="hot-issue">
      <h2>헤드라인 뉴스</h2>

      <ul className="hot-list">
        {articles.map((article) => (
          <li key={article.articleId} className="hot-item">
            {/* 썸네일 */}
            <div className="hot-thumbnail">
              {article.mediaList?.[0]?.url ? (
                <img src={article.mediaList[0].url} alt={article.title} />
              ) : (
                <div className="thumbnail-placeholder">
                  <span>📰</span>
                </div>
              )}
            </div>

            {/* 제목과 메타 정보 */}
            <div className="hot-content">
              <Link to={`/news/${article.articleId}`} className="hot-title">
                {article.title}
              </Link>
              <span className="hot-meta">관련뉴스 {article.clusterCount}개</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
