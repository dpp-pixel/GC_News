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
          <li
            key={article.articleId}
            className="hot-item"
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            {/* 썸네일 */}
            {article.mediaList?.[0]?.url && (
              <div
                style={{
                  flexShrink: 0,
                  width: "60px",
                  height: "60px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={article.mediaList[0].url}
                  alt={article.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}

            {/* ❗️여기가 핵심: 제목 클릭 → 기사 상세 */}
            <Link
              to={`/news/${article.articleId}`}
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                color: "#000",
                textDecoration: "none",
              }}
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
