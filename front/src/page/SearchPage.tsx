import "./SearchPage.css";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageParam);

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 검색 결과 가져오기
  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/articles/search`, {
          params: { keyword, page: page - 1, size: PAGE_SIZE },
        });

        // 예: res.data = { content: [...], totalElements: 100 }
        setResults(res.data.content || []);
        setTotal(res.data.totalElements || 0);
      } catch (err) {
        console.error(err);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setSearchParams({ keyword, page: p.toString() });
  };

  return (
  <div className="search-container">
    <h2 className="search-title">검색 결과: "{keyword}"</h2>

    {loading && <p>검색 중...</p>}
    {!loading && results.length === 0 && <p>검색 결과가 없습니다.</p>}

    <ul className="search-list">
      {results.map((article) => (
        <li key={article.articleId} className="search-item">
          {article.mediaList && article.mediaList.length > 0 && (
            <img
              src={article.mediaList[0].url}
              alt={article.title}
              className="search-thumb"
            />
          )}

          <h3
            className="search-title-link"
            onClick={() => navigate(`/news/${article.articleId}`)}
            dangerouslySetInnerHTML={{ __html: article.title || "" }}
          />
        </li>
      ))}
    </ul>

    {totalPages > 1 && (
      <div className="search-pagination">
        <button onClick={() => goPage(page - 1)} disabled={page === 1}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button onClick={() => goPage(page + 1)} disabled={page === totalPages}>
          다음
        </button>
      </div>
    )}
  </div>
);
}
