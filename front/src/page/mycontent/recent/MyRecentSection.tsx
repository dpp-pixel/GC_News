// src/page/mycontent/recent/MyRecentSection.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./MyRecentSection.css";

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

export default function MyRecentSection() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );
        setRecentArticles(res.data.slice(0, 10));
      } catch (e) {
        console.error("최근 본 기사 로딩 실패:", e);
      }
    };

    fetchArticles();
  }, []);

  const handleClearRecentAll = () => {
    if (recentArticles.length === 0) return;
    if (
      window.confirm(
        "최근 본 기사를 모두 삭제하시겠습니까? (현재는 화면에서만 삭제됩니다)"
      )
    ) {
      setRecentArticles([]);
    }
  };

  const handleDeleteRecentOne = (id: number) => {
    setRecentArticles((prev) =>
      prev.filter((a) => a.articleId !== id)
    );
  };

  return (
    <div className="bookmark-layout recent-layout">
      {/* 왼쪽 분석 영역 */}
      <aside className="bookmark-filter recent-activity">
        <h3>최근 활동 분석 (임시)</h3>
        <p>나중에 “기사 열람 통계” 같은 내용을 넣을 자리입니다.</p>
      </aside>

      {/* 오른쪽 리스트 */}
      <section className="bookmark-main recent-main">
        <div className="bookmark-header">
          <span className="bookmark-count">
            총 {recentArticles.length}개 최근 본 (임시)
          </span>
          <button
            type="button"
            className="bookmark-clear"
            onClick={handleClearRecentAll}
          >
            전체 삭제
          </button>
        </div>

        {recentArticles.length === 0 ? (
          <div className="bookmark-empty">
            최근 본 기사가 없습니다.
            <br />
            (이 영역은 나중에 실제 최근 본 데이터와 연결될 예정입니다.)
          </div>
        ) : (
          <ul className="bookmark-list">
            {recentArticles.map((article) => (
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
                  <div className="bookmark-title">
                    {article.title}
                  </div>

                  <div className="bookmark-meta">
                    <span>{article.press}</span>
                    <span>
                      ·{" "}
                      {new Date(
                        article.publishedAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="bookmark-stats">
                    <span>댓글 0</span>
                    <span>좋아요 0</span>
                    <button
                      type="button"
                      className="bookmark-delete"
                      onClick={() =>
                        handleDeleteRecentOne(article.articleId)
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
          최근 본 기사가 10개를 넘으면 페이지를 나눠서 보여줄 예정입니다
          (임시 안내 문구).
        </div>
      </section>
    </div>
  );
}
