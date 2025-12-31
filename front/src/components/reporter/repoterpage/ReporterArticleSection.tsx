// src/components/reporter/repoterpage/ReporterArticleSection.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

interface Article {
  articleId?: number; // 기자 페이지용 크롤링 데이터에는 없을 수도 있으니 optional
  title: string;
  summary?: string;
  press: string;
  publishedAt: string;
  urlString: string;
  viewCount?: number | null;
  mediaList?: { url: string; mediaType: string }[];
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

        // 백엔드에서 Map.of("reporter", ..., "articles", ...) 구조라고 가정
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
    return <div>기자 기사 불러오는 중...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (visibleArticles.length === 0) {
    return <div>이 기자의 기사가 없습니다.</div>;
  }

  // 3) 실제 렌더링
  return (
    <section>
      <ul>
        {visibleArticles.map((article) => {
          const key = article.articleId ?? article.urlString;
          const imageUrl = article.mediaList?.[0]?.url;

          // articleId가 있으면 우리 서비스 상세 페이지로,
          // 없으면 원문 링크로 보내는 예시
          const internalLink =
            article.articleId !== undefined && article.articleId !== null;

          const content = (
            <>
              <div>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div>이미지 없음</div>
                )}
              </div>

              <div>
                <h3>{article.title}</h3>
                <p>{article.summary ?? "요약 정보가 없습니다."}</p>
                <div>
                  <span>{article.press}</span>
                  <span>
                    {" · "}
                    {new Date(article.publishedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          );

          return (
            <li key={key}>
              {internalLink ? (
                <Link to={`/news/${article.articleId}`}>{content}</Link>
              ) : (
                // DB에 없는 기사라면 네이버 원문으로 이동
                <a
                  href={article.urlString}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div ref={loaderRef} style={{ padding: "16px", textAlign: "center" }}>
          더 불러오는 중...
        </div>
      )}
    </section>
  );
}
