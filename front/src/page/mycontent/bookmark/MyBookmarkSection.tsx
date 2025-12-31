// src/page/mycontent/bookmark/MyBookmarkSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { Loading } from "@/components";
import "./MyBookmarkSection.css";

interface Article {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  urlString: string;
  viewCount: number | null;
  theme?: {
    themeId: number;
    name: string;
  } | null;
  mediaList?: {
    url: string;
    mediaType: string;
  }[];
}

/** ✅ 필터 목록 */
const BOOKMARK_FILTERS = ["전체", "정치", "경제", "사회", "생활/문화", "세계", "IT/과학"];

/** ✅ 필터 ↔ DB theme.name 매핑 (핵심) */
const FILTER_THEME_MAP: Record<string, string[]> = {
  전체: [],
  정치: ["정치"],
  경제: ["경제"],
  사회: ["사회"],
  "생활/문화": ["생활/문화"], 
  세계: ["세계"],
  "IT/과학": ["IT", "과학", "IT/과학"],
};

export default function MyBookmarkSection() {
  const navigate = useNavigate();

  const [bookmarkArticles, setBookmarkArticles] = useState<Article[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 🔹 북마크 조회 */
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get<Article[]>("/bookmarks/my");
      setBookmarkArticles(res.data);
    } catch (e: any) {
      console.error("북마크 조회 실패", e);
      setError("북마크 기사 로딩에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  /** 🔹 필터 적용 */
  const filteredBookmarks =
    selectedFilter === "전체"
      ? bookmarkArticles
      : bookmarkArticles.filter((a) =>
          FILTER_THEME_MAP[selectedFilter]?.includes(a.theme?.name ?? "")
        );

  /** 🔹 단일 북마크 삭제 */
  const handleDeleteOneBookmark = async (articleId: number) => {
    if (!window.confirm("이 북마크를 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/bookmarks/${articleId}`);
      setBookmarkArticles((prev) =>
        prev.filter((a) => a.articleId !== articleId)
      );
    } catch (e: any) {
      console.error("북마크 삭제 실패", e);
      alert("북마크 삭제에 실패했습니다.");
    }
  };

  /** 🔹 전체 북마크 삭제 */
  const handleClearAllBookmarks = async () => {
    if (bookmarkArticles.length === 0) return;
    if (!window.confirm("북마크를 모두 삭제하시겠습니까?")) return;

    try {
      await api.delete("/bookmarks/all");
      setBookmarkArticles([]);
    } catch (e: any) {
      console.error("전체 삭제 실패", e);
      alert("전체 북마크 삭제에 실패했습니다.");
    }
  };

  /** ✅ 로딩 / 에러 처리 */
  if (loading) return <Loading text="북마크 불러오는 중..." />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="bookmark-layout">
      {/* 🔹 필터 영역 */}
      <aside className="bookmark-filter">
        <h3>북마크 콘텐츠</h3>
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

      {/* 🔹 리스트 영역 */}
      <section className="bookmark-main">
        <div className="bookmark-header">
          <span>총 {filteredBookmarks.length}개</span>
          <button
            type="button"
            className="bookmark-clear"
            onClick={handleClearAllBookmarks}
          >
            전체 삭제
          </button>
        </div>

        {filteredBookmarks.length === 0 ? (
          <div className="bookmark-empty">북마크된 기사가 없습니다.</div>
        ) : (
          <ul className="bookmark-list">
            {filteredBookmarks.map((article) => (
              <li key={article.articleId} className="bookmark-item">
                {/* 썸네일 */}
                <div className="bookmark-thumb">
                  {article.mediaList?.[0]?.url ? (
                    <img
                      src={article.mediaList[0].url}
                      alt={article.title}
                      onClick={() =>
                        navigate(`/news/${article.articleId}`)
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <div
                      className="no-image-box"
                      onClick={() =>
                        navigate(`/news/${article.articleId}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div
                  className="bookmark-info"
                  onClick={() =>
                    navigate(`/news/${article.articleId}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="bookmark-title">{article.title}</div>
                  <div className="bookmark-meta">
                    <span>{article.press}</span>
                    <span>
                      ·{" "}
                      {new Date(article.publishedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <div className="bookmark-stats">
                  <button
                    className="bookmark-delete"
                    onClick={() =>
                      handleDeleteOneBookmark(article.articleId)
                    }
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="bookmark-footer">
          북마크가 많아지면 페이지네이션 예정
        </div>
      </section>
    </div>
  );
}
