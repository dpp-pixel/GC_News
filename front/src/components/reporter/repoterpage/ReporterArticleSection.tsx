// src/components/reporter/repoterpage/ReporterArticleSection.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loading } from "@/components"; // ✅ 추가
import styles from "./ReporterArticleSection.module.css";

interface Article {
  articleId: number;
  title: string;
  summary?: string;
  press: string;
  publishedAt: string;
  urlString: string;
  viewCount: number | null;
  mediaList?: { url: string; mediaType: string }[];
}

const PAGE_SIZE = 10;

export default function ReporterArticleSection() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [visibleArticles, setVisibleArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ✅ 로딩 / 에러 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* 최초 기사 로딩 */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );

        setAllArticles(res.data);
        setVisibleArticles(res.data.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(res.data.length > PAGE_SIZE);
      } catch (e) {
        console.error("기사 로딩 실패:", e);
        setError("기자 기사를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  /* 무한 스크롤 */
  useEffect(() => {
    // ✅ 초기 로딩 중이거나, 더 불러올 것이 없으면 옵저버 안 붙이기
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

  // ✅ 1단계: 초기 로딩
  if (loading) {
    return <Loading text="최신 기사 불러오는 중" />;
  }

  // ✅ 2단계: 에러
  if (error) {
    return (
      <section className={styles.section}>
        <p style={{ color: "red", padding: "16px 0" }}>{error}</p>
      </section>
    );
  }

  // ✅ 3단계: 데이터 없음
  if (visibleArticles.length === 0) {
    return (
      <section className={styles.section}>
        <p>표시할 기사가 없습니다.</p>
      </section>
    );
  }

  // ✅ 4단계: 정상 렌더링
  return (
    <section className={styles.section}>
      <ul className={styles.list}>
        {visibleArticles.map((article) => {
          const imageUrl = article.mediaList?.[0]?.url;

          return (
            <li key={article.articleId} className={styles.item}>
              <Link
                to={`/news/${article.articleId}`}
                className={styles.articleLink}
              >
                {/* 썸네일 */}
                <div className={styles.thumb}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>이미지 없음</div>
                  )}
                </div>

                {/* 기사 내용 */}
                <div className={styles.content}>
                  <h3 className={styles.itemTitle}>{article.title}</h3>

                  <p className={styles.summary}>
                    {article.summary ??
                      "기사 요약 정보가 제공되지 않았습니다."}
                  </p>

                  <div className={styles.meta}>
                    <span>{article.press}</span>
                    <span>
                      ·{" "}
                      {new Date(article.publishedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ✅ 여기 아래 로딩은 '무한 스크롤 추가 로딩용' 그대로 유지 */}
      {hasMore && (
        <div ref={loaderRef} className={styles.loader}>
          로딩 중...
        </div>
      )}
    </section>
  );
}
