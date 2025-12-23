// src/components/reporter/repoterpage/ReporterArticleSection.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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

  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* 최초 기사 로딩 */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );

        setAllArticles(res.data);
        setVisibleArticles(res.data.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(res.data.length > PAGE_SIZE);
      } catch (e) {
        console.error("기사 로딩 실패:", e);
      }
    };

    fetchArticles();
  }, []);

  /* 무한 스크롤 */
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore]);

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
                  <h3 className={styles.itemTitle}>
                    {article.title}
                  </h3>

                  <p className={styles.summary}>
                    {article.summary ??
                      "기사 요약 정보가 제공되지 않았습니다."}
                  </p>

                  <div className={styles.meta}>
                    <span>{article.press}</span>
                    <span>
                      ·{" "}
                      {new Date(
                        article.publishedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div ref={loaderRef} className={styles.loader}>
          로딩 중...
        </div>
      )}
    </section>
  );
}
