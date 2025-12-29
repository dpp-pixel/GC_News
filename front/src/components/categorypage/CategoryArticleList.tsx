import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./CategoryArticleList.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
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
            {/* ❗️여기가 핵심: 제목 클릭 → 기사 상세 */}
            <Link to={`/news/${a.articleId}`} className="article-link">
              <span className="title">{a.title}</span>
              <span className="meta">
                {a.press} ·{" "}
                {new Date(a.publishedAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          이전
        </button>
        <span>
          {page + 1} / {totalPages}
        </span>
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
