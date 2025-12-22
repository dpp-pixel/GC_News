// src/page/mycontent/bookmark/MyBookmarkSection.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./MyBookmarkSection.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  urlString: string;
  viewCount: number | null;
  theme?: { themeId: number; name: string } | null;
  mediaList?: { url: string; mediaType: string }[];
}

const BOOKMARK_FILTERS = ["전체", "정치", "경제", "사회", "세계", "IT/과학"];

function getArticleCategory(a: Article): string {
  return a.theme?.name ?? "기타";
}

export default function MyBookmarkSection() {
  const [bookmarkArticles, setBookmarkArticles] = useState<Article[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("전체");
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingBookmarks(true);
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );
        setBookmarkArticles(res.data.slice(0, 10));
      } catch (e) {
        console.error("기사 로딩 실패:", e);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredBookmarks =
    selectedFilter === "전체"
      ? bookmarkArticles
      : bookmarkArticles.filter(
          (a) => getArticleCategory(a) === selectedFilter
        );

  const handleClearAllBookmarks = () => {
    if (bookmarkArticles.length === 0) return;
    if (
      window.confirm(
        "북마크를 모두 삭제하시겠습니까? (현재는 화면에서만 삭제됩니다)"
      )
    ) {
      setBookmarkArticles([]);
    }
  };

  const handleDeleteOneBookmark = (id: number) => {
    setBookmarkArticles((prev) => prev.filter((a) => a.articleId !== id));
  };

  return (
    <div className="bookmark-layout">
      {/* 왼쪽 필터 */}
      <aside className="bookmark-filter">
        <h3>북마크 콘텐츠 (필터)</h3>
        <ul className="filter-list">
          {BOOKMARK_FILTERS.map((f) => (
            <li
              key={f}
              className={`filter-item ${
                selectedFilter === f ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </li>
          ))}
        </ul>
      </aside>

      {/* 오른쪽 리스트 */}
      <section className="bookmark-main">
        <div className="bookmark-header">
          <span className="bookmark-count">
            총 {filteredBookmarks.length}개 북마크 (임시)
          </span>
          <button
            type="button"
            className="bookmark-clear"
            onClick={handleClearAllBookmarks}
          >
            전체 삭제
          </button>
        </div>

        {loadingBookmarks ? (
          <div className="bookmark-empty">북마크 기사 불러오는 중...</div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bookmark-empty">
            북마크된 기사가 없습니다.
            <br />
            (현재는 /api/articles 결과를 임시로 사용 중)
          </div>
        ) : (
          <ul className="bookmark-list">
            {filteredBookmarks.map((article) => (
              <li key={article.articleId} className="bookmark-item">
                <div className="bookmark-thumb">
                  {article.mediaList?.[0]?.url ? (
                    <img
                      src={article.mediaList[0].url}
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add(
                          "no-image"
                        );
                      }}
                    />
                  ) : (
                    <div className="no-image-box">이미지 없음</div>
                  )}
                </div>

                <div className="bookmark-info">
                  <div className="bookmark-title">{article.title}</div>

                  <div className="bookmark-meta">
                    <span>{article.press}</span>
                    <span>
                      ·{" "}
                      {new Date(article.publishedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="bookmark-stats">
                    <span>댓글 0</span>
                    <span>좋아요 0</span>
                    <button
                      type="button"
                      className="bookmark-delete"
                      onClick={() =>
                        handleDeleteOneBookmark(article.articleId)
                      }
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="bookmark-footer">
          북마크 기사가 10개를 넘으면 페이지를 나눠서 보여줄 예정입니다
          (임시 안내 문구).
        </div>
      </section>
    </div>
  );
}
