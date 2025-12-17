import { useEffect, useState } from "react";
import axios from "axios";
import "./LatestNewsList.css";
import { Link } from "react-router-dom";
interface Article {
  articleId: number;
  title: string;
  press: string;
  urlString: string;
  publishedAt: string;
  mediaList?: { url: string }[];
}

export default function LatestNewsList() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/articles");
        setNews(res.data.slice(0, 16));
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) return <p>최신 기사 불러오는 중...</p>;

  const leftNews = news.slice(0, 3);
  const centerNews = news.slice(3);

  return (
    <section className="latest-news">
      <h2 className="latest-title">최신 기사</h2>

      <div className="latest-grid">
        {/*  왼쪽 */}
        <div className="latest-left">
          {leftNews.map(item => (
            <article key={item.articleId} className="image-article">
              {item.mediaList?.[0]?.url && (
                <div className="image-wrap">
                  <img src={item.mediaList[0].url} alt={item.title} />
                </div>
              )}
              <Link to={`/article/${item.articleId}`}>
  <h4>{item.title}</h4>
</Link>
              <p className="meta">
                {item.press} · {new Date(item.publishedAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>

        {/* 중앙 */}
        <div className="latest-center">
          <ul>
            {centerNews.map(item => (
              <li key={item.articleId}>
                <Link to={`/article/${item.articleId}`}>
  {item.title}
</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🔹 오른쪽 (비워둠) */}
        <div className="latest-right">
          {/* 나중에 칼럼, 오피니언 */}
        </div>
      </div>
    </section>
  );
}
