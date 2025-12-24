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

  /** 로그인 유저 북마크 조회 */
  const fetchBookmarks = async () => {
    try {
      setLoadingBookmarks(true);
      const res = await axios.get<Article[]>(
        "http://localhost:8081/api/bookmarks/my"
      );
      setBookmarkArticles(res.data);
    } catch (e) {
      console.error("북마크 로딩 실패:", e);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const filteredBookmarks =
    selectedFilter === "전체"
      ? bookmarkArticles
      : bookmarkArticles.filter(
          (a) => getArticleCategory(a) === selectedFilter
        );

  /** 단일 북마크 삭제 */
  const handleDeleteOneBookmark = async (articleId: number) => {
    try {
      await axios.delete(`http://localhost:8081/api/bookmarks/${articleId}`);
      setBookmarkArticles((prev) =>
        prev.filter((a) => a.articleId !== articleId)
      );
    } catch (e) {
      console.error("북마크 삭제 실패:", e);
    }
  };

  /** 전체 북마크 삭제 */
  const handleClearAllBookmarks = async () => {
    if (bookmarkArticles.length === 0) return;
    if (!window.confirm("북마크를 모두 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/bookmarks`);
      setBookmarkArticles([]);
    } catch (e) {
      console.error("전체 북마크 삭제 실패:", e);
    }
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
            총 {filteredBookmarks.length}개 북마크
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
                      · {new Date(article.publishedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="bookmark-stats">
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
        </div>
      </section>
    </div>
  );
}
