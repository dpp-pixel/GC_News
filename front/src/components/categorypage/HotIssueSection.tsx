import { useEffect, useState } from "react";
import axios from "axios";
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
      .get<Article[]>("http://localhost:8081/api/articles/hot", {
        params: {
          days: 3,
          limit: 5,
          themeId, //  있으면 좋음 (없으면 프론트 필터)
        },
      })
      .then((res) => setArticles(res.data))
      .catch(console.error);
  }, [themeId]);

  if (articles.length === 0) return null;

  return (
    <section className="hot-issue">
  <h2>HOT 이슈</h2>

  <ul className="hot-list">
    {articles.map((article) => (
      <li
        key={article.articleId}
        className="hot-item"
        style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}
      >
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
        <a
          href={article.urlString}
          target="_blank"
          rel="noreferrer"
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            color: "#000",
            textDecoration: "none",
          }}
        >
          {article.title}
        </a>
      </li>
    ))}
  </ul>
</section>

  );
}
