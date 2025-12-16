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

      <div className="hot-main">
        {articles[0].mediaList?.[0]?.url && (
          <img src={articles[0].mediaList[0].url} alt="" />
        )}

        <a href={articles[0].urlString} target="_blank" rel="noreferrer">
          <h3>{articles[0].title}</h3>
        </a>
      </div>

      <ul className="hot-list">
        {articles.slice(1).map((a) => (
          <li key={a.articleId}>
            <a href={a.urlString} target="_blank" rel="noreferrer">
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
