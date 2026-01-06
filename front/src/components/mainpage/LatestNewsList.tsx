import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loading } from "@/components";
import "./LatestNewsList.css";

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
  const [columns, setColumns] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 최신 기사와 칼럼을 병렬로 fetch
        const [newsRes, columnsRes] = await Promise.all([
          axios.get<Article[]>("http://localhost:8081/api/articles/latest?limit=16"),
          axios.get<Article[]>("http://localhost:8081/api/articles/columns?limit=10")
        ]);

        if (!cancelled) {
          setNews(newsRes.data);
          setColumns(columnsRes.data);
        }
      } catch (e: any) {
        console.error("LatestNewsList fetch error:", e);
        if (!cancelled) {
          setError("기사 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* 여기만 핵심 변경 */
  if (loading) {
    return <Loading text="최신 기사 불러오는 중" />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (news.length === 0) {
    return <p>표시할 최신 기사가 없습니다.</p>;
  }

  const leftNews = news.slice(0, 3);
  const centerNews = news.slice(3);

  return (
    <section className="latest-news">
      <h2 className="latest-title">최신 기사</h2>

      <div className="latest-grid">
  {/* 왼쪽: 썸네일 있는 큰 카드 3개 */}
  <div className="latest-left">
    {leftNews.map((item) => (
      <article key={item.articleId} className="image-article">
        {item.mediaList?.[0]?.url && (
          <div className="image-wrap">
            <img src={item.mediaList[0].url} alt={item.title} />
          </div>
        )}
        <Link to={`/news/${item.articleId}`}>
          <h4>{item.title}</h4>
        </Link>
        <p className="meta">
          {item.press} · {new Date(item.publishedAt).toLocaleDateString()}
        </p>
      </article>
    ))}
  </div>


        {/* 중앙: 제목 리스트 */}
        <div className="latest-center">
          <ul>
            {centerNews.map((item) => (
              <li key={item.articleId}>
                <Link to={`/news/{item.articleId}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 오른쪽: 칼럼 */}
        <div className="latest-right">
          <h3 className="column-title">칼럼</h3>
          <ul className="column-list">
            {columns.map((col) => (
              <li key={col.articleId}>
                <Link to={`/news/${col.articleId}`}>
                  <span className="column-press">{col.press}</span>
                  <span className="column-title-text">{col.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
}
