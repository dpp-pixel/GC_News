import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./CategoryArticleList.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  aiScore?: number | null;
}

export default function CategoryArticleList({ themeId }: { themeId: number }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/articles/category/${themeId}`, {
        params: { page, size: 10 },
      })
      .then((res) => {
        setArticles(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(console.error);
  }, [page, themeId]);

  return (
    <section className="category-list">
      <h2>최신 기사</h2>

      <ul>
        {articles.map((a) => (
    <li key={a.articleId}>
      <Link to={`/news/${a.articleId}`} className="article-link">
        {/* 제목 + 뱃지를 한 줄로 묶기 */}
        <span className="title-row">
          <span className="title">{a.title}</span>

          {a.aiScore != null && (
            <span className="ai-score-badge ai-score-badge-list">
              AI {a.aiScore}점
            </span>
          )}
        </span>

        <span className="meta">
          {a.press} · {new Date(a.publishedAt).toLocaleDateString()}
        </span>
      </Link>
    </li>
  ))}
      </ul>

      <div className="pagination">
  {/* 이전 버튼 */}
  <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
    이전
  </button>

  {/* 항상 첫 페이지 */}
  <button
    className={page === 0 ? "active" : ""}
    onClick={() => setPage(0)}
  >
    1
  </button>

  {/* 시작 … */}
  {page > 3 && <span>…</span>}

  {/* 현재 페이지 주변 페이지 ±2 표시 */}
  {Array.from({ length: totalPages }, (_, i) => i)
    .filter(i => i > 0 && i < totalPages - 1 && Math.abs(i - page) <= 2)
    .map(i => (
      <button
        key={i}
        className={i === page ? "active" : ""}
        onClick={() => setPage(i)}
      >
        {i + 1}
      </button>
    ))}

  {/* 끝 … */}
  {page < totalPages - 4 && <span>…</span>}

  {/* 항상 마지막 페이지 */}
  {totalPages > 1 && (
    <button
      className={page === totalPages - 1 ? "active" : ""}
      onClick={() => setPage(totalPages - 1)}
    >
      {totalPages}
    </button>
  )}

  {/* 다음 버튼 */}
  <button
    disabled={page + 1 === totalPages}
    onClick={() => setPage((p) => p + 1)}
  >
    다음
  </button>
</div>

    </section>
  );
}
