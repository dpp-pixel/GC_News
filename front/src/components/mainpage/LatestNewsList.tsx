import { useEffect, useState } from "react";
import axios from "axios";
import "./LatestNewsList.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  urlString: string;
  publishedAt: string;
}

export default function LatestNewsList() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/articles");
        setNews(res.data.slice(0, 10)); // 최신 10개
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) return <p>최신 기사 불러오는 중...</p>;

  return (
    <section className="latest-news">
      <h2 className="latest-title">최신 기사</h2>

      <ul className="latest-list">
        {news.map(item => (
          <li key={item.articleId}>
            <a href={item.urlString} target="_blank" rel="noreferrer">
              <span className="title">{item.title}</span>
              <span className="meta">
                {item.press} · {new Date(item.publishedAt).toLocaleDateString()}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
