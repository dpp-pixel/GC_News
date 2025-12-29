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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);

         const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles/latest?limit=16"
        );

        if (!cancelled) {
          setNews(res.data); // 이미 최신순으로 반환됨
        }
      } catch (e: any) {
        console.error("LatestNewsList /api/articles/latest error:", e);
        if (!cancelled) {
          setError("최신 기사 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLatest();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ✅ 여기만 핵심 변경 */
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
                {item.press} ·{" "}
                {new Date(item.publishedAt).toLocaleDateString()}
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

        {/* 오른쪽: 예약 영역 */}
        <div className="latest-right" />
      </div>
    </section>
  );
}
