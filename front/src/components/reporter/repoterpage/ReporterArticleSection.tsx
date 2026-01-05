// src/components/reporter/repoterpage/ReporterArticleSection.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./ReporterArticleSection.module.css"; // CSS 추가

interface Article {
  articleId?: number; // 기자 페이지용 크롤링 데이터에는 없을 수도 있으니 optional
  title: string;
  summary?: string;
  press: string;
  publishedAt: string;
  urlString: string;
  viewCount?: number | null;
  mediaList?: { url: string; mediaType: string }[];
  thumbnailUrl?: string | null;
}

const PAGE_SIZE = 10;

export default function ReporterArticleSection() {
  const { reporterId } = useParams<{ reporterId: string }>();

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [visibleArticles, setVisibleArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 1) 처음에 기자 기사 목록 불러오기
  useEffect(() => {
    if (!reporterId) return;

    const fetchReporterArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `http://localhost:8081/api/reporters/${reporterId}`
        );

        // 백엔드에서 Map.of("reporter", ..., "articles", ...) 구조
        const articles: Article[] = res.data.articles ?? [];

        setAllArticles(articles);
        setVisibleArticles(articles.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(articles.length > PAGE_SIZE);
      } catch (e) {
        console.error("기자 기사 로딩 실패:", e);
        setError("기자가 작성한 기사를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReporterArticles();
  }, [reporterId]);

  // 2) 무한 스크롤용 IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  const loadMore = () => {
    const start = page * PAGE_SIZE;
    const next = allArticles.slice(start, start + PAGE_SIZE);

    if (next.length === 0) {
      setHasMore(false);
      return;
    }

    setVisibleArticles((prev) => [...prev, ...next]);
    setPage((prev) => prev + 1);
  };

  // 로딩/에러/빈 데이터 처리
  if (loading) {
    return <div className="loader">기자 기사 불러오는 중...</div>;
  }

  if (error) {
    return <div className="loader" style={{ color: "red" }}>{error}</div>;
  }

  if (visibleArticles.length === 0) {
    return <div className="loader">이 기자의 기사가 없습니다.</div>;
  }

  // 3) 실제 렌더링
  return (
    <section className="section">
      <ul className="list">
        {visibleArticles.map((article) => {
          const key = article.articleId ?? article.urlString;

          // 1순위: 우리 DB mediaList, 2순위: 기자 페이지 썸네일
          const imageUrl =
            article.mediaList?.[0]?.url ??
            article.thumbnailUrl ??
            null;

          const internalLink =
            article.articleId !== undefined && article.articleId !== null;

          const content = (
            <div className="articleLink">
              <div className="thumb">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="noImage">이미지 없음</div>
                )}
              </div>

              <div className="content">
                <h3 className="itemTitle">{article.title}</h3>
                <p className="summary">
                  {article.summary ?? "요약 정보가 없습니다."}
                </p>
                <div className="meta">
                  <span>{article.press}</span>
                  <span>
                    {" · "}
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );

          return (
            <li key={key} className="item">
              {internalLink ? (
                <Link to={`/news/${article.articleId}`} className="articleLinkWrapper">
                  {content}
                </Link>
              ) : (
                <a
                  href={article.urlString}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="articleLinkWrapper"
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div ref={loaderRef} className="loader">
          더 불러오는 중...
        </div>
      )}
    </section>
  );
}