// src/page/MyContentsPage.tsx
import { useEffect, useState } from "react";
import ReporterCard, { type ReporterInfo } from "../../components/reporter/ReporterCard";
import axios from "axios";
import "./MyContentsPage.css";

/* ====== 1) 기자 구독용 더미 데이터 ====== */
const MOCK_REPORTERS: ReporterInfo[] = [
  {
    id: 1,
    name: "김대기",
    email: "watingkim@donga.com",
    subscribers: 100,
    recommends: 3,
    tags: ["정치부", "정직한", "솔직한"],
    trustScore: 80,
    imageUrl: "",
  },
  {
    id: 2,
    name: "김장철",
    email: "kimchiseason@news.com",
    subscribers: 95,
    recommends: 12,
    tags: ["경제", "침착한"],
    trustScore: 78,
    imageUrl: "",
  },
  {
    id: 3,
    name: "이서연",
    email: "seoyeon@press.co.kr",
    subscribers: 140,
    recommends: 23,
    tags: ["사회", "깊이있는"],
    trustScore: 82,
    imageUrl: "",
  },
  {
    id: 4,
    name: "박민수",
    email: "minsu@media.com",
    subscribers: 88,
    recommends: 9,
    tags: ["국방", "분석력 좋은"],
    trustScore: 76,
    imageUrl: "",
  },
  {
    id: 5,
    name: "한성태",
    email: "hansung@news.com",
    subscribers: 120,
    recommends: 35,
    tags: ["정치부", "차분한"],
    trustScore: 80,
    imageUrl: "",
  },
];

const VISIBLE_COUNT = 4;

/* ====== 2) 탭 / 기사 / 댓글 타입 정의 ====== */

type TabKey = "subscribe" | "bookmark" | "recent" | "comment";

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

/** 내 댓글 타입 */
interface MyCommentItem {
  id: number;
  articleTitle: string;
  articleThumbUrl: string;
  commentedAt: string; // "2025.12.19 오후 10:48"
  text: string;
  likeCount: number;
  dislikeCount: number;
}

/** 내 댓글 더미 데이터 (UI 확인용) */
const MOCK_COMMENTS: MyCommentItem[] = [
  {
    id: 1,
    articleTitle:
      "김 총리 “이재명 정부 5년 짧다더라… 더 했으면 좋겠다는 분도”",
    articleThumbUrl:
      "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    commentedAt: "2025.12.19 오후 10:30",
    text: "방금 전 ;;",
    likeCount: 12,
    dislikeCount: 1,
  },
  {
    id: 2,
    articleTitle:
      "국방장관 ‘게임땐 대업 간부 징계’ 보도에 “알려진 내용과 달라”",
    articleThumbUrl:
      "https://mimgnews.pstatic.net/image/005/2025/12/19/0000000000.jpg?type=nf220_150",
    commentedAt: "2025.12.18 오후 3:12",
    text: "이 부분은 자료를 더 보고 판단해야 할 것 같네요.",
    likeCount: 5,
    dislikeCount: 0,
  },
  {
    id: 3,
    articleTitle:
      "[속보] 李 “남북, 과거엔 원수인척… 이젠 진짜 원수된 느낌”",
    articleThumbUrl:
      "https://mimgnews.pstatic.net/image/021/2025/12/19/0000000000.jpg?type=nf220_150",
    commentedAt: "2025.12.17 오전 9:05",
    text: "표현이 너무 자극적인 것 같습니다.",
    likeCount: 3,
    dislikeCount: 2,
  },
];

type CommentSortKey = "created" | "reaction";

export default function MyContentsPage() {
  /* ✅ 탭 상태 */
  const [activeTab, setActiveTab] = useState<TabKey>("subscribe");

  /* ✅ 내 구독(기자 카드 슬라이더) 상태 */
  const [startIndex, setStartIndex] = useState(0);

  /* ✅ 북마크 / 최근 본 기사 상태 (임시로 둘 다 /api/articles 사용) */
  const [bookmarkArticles, setBookmarkArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("전체");
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  /* ✅ 내 댓글 상태 */
  const [myComments, setMyComments] = useState<MyCommentItem[]>(MOCK_COMMENTS);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("created");

  /* --- 내 구독(슬라이더) 계산 --- */
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + VISIBLE_COUNT < MOCK_REPORTERS.length;

  const visibleReporters = MOCK_REPORTERS.slice(
    startIndex,
    startIndex + VISIBLE_COUNT
  );

  const handlePrev = () => {
    if (!canGoPrev) return;
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setStartIndex((prev) =>
      Math.min(MOCK_REPORTERS.length - VISIBLE_COUNT, prev + 1)
    );
  };

  /* --- 북마크/최근본용 기사 로딩 (현재는 /api/articles 앞 10개를 공용으로 사용) --- */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingBookmarks(true);
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );
        const top10 = res.data.slice(0, 10);
        setBookmarkArticles(top10);
        setRecentArticles(top10); // 최근 본도 동일 데이터로 임시 사용
      } catch (e) {
        console.error("기사 로딩 실패:", e);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    fetchArticles();
  }, []);

  /* --- 북마크 필터링 & 삭제(임시) --- */
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

  /* --- 최근 본: 전체 삭제 / 개별 삭제 (임시) --- */
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
    setRecentArticles((prev) => prev.filter((a) => a.articleId !== id));
  };

  /* --- 내 댓글: 정렬 / 삭제 로직 --- */
  const sortedComments = [...myComments].sort((a, b) => {
    if (commentSort === "created") {
      // 작성순: 최근 작성 댓글이 위로
      return (
        new Date(b.commentedAt).getTime() -
        new Date(a.commentedAt).getTime()
      );
    }
    // 반응순: (좋아요+싫어요) 많은 순
    const aScore = a.likeCount + a.dislikeCount;
    const bScore = b.likeCount + b.dislikeCount;
    return bScore - aScore;
  });

  const handleClearAllComments = () => {
    if (myComments.length === 0) return;
    if (window.confirm("작성한 댓글을 모두 삭제하시겠습니까?")) {
      setMyComments([]);
    }
  };

  const handleDeleteOneComment = (id: number) => {
    setMyComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="my-contents-page">
      {/* 상단 탭 영역 */}
      <div className="my-tabs">
        <button
          className={`tab ${activeTab === "subscribe" ? "active" : ""}`}
          onClick={() => setActiveTab("subscribe")}
        >
          내 구독
        </button>
        <button
          className={`tab ${activeTab === "bookmark" ? "active" : ""}`}
          onClick={() => setActiveTab("bookmark")}
        >
          북마크
        </button>
        <button
          className={`tab ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => setActiveTab("recent")}
        >
          최근 본
        </button>
        <button
          className={`tab ${activeTab === "comment" ? "active" : ""}`}
          onClick={() => setActiveTab("comment")}
        >
          내 댓글
        </button>
      </div>

      {/* ===== 1) 내 구독: 기자 카드 슬라이더 ===== */}
      {activeTab === "subscribe" && (
        <div className="reporter-slider">
          <button
            type="button"
            className={`arrow left ${canGoPrev ? "" : "disabled"}`}
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            &#60;
          </button>

          <div className="card-track">
            {visibleReporters.map((reporter) => (
              <ReporterCard key={reporter.id} info={reporter} />
            ))}
          </div>

          <button
            type="button"
            className={`arrow right ${canGoNext ? "" : "disabled"}`}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            &#62;
          </button>
        </div>
      )}

      {/* ===== 2) 북마크 탭 ===== */}
      {activeTab === "bookmark" && (
        <div className="bookmark-layout">
          {/* 왼쪽 필터 영역 */}
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

          {/* 오른쪽 기사 리스트 영역 */}
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
                {filteredBookmarks.map((article: Article) => (
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
      )}

      {/* ===== 3) 최근 본 탭 ===== */}
      {activeTab === "recent" && (
        <div className="bookmark-layout recent-layout">
          {/* 왼쪽: 최근 활동 분석 박스 (북마크 필터와 같은 폭) */}
          <aside className="bookmark-filter recent-activity">
            <h3>최근 활동 분석 (임시)</h3>
            <p>나중에 “기사 열람 통계” 같은 내용을 넣을 자리입니다.</p>
          </aside>

          {/* 오른쪽: 최근 본 기사 리스트 (북마크 메인과 동일 레이아웃) */}
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
                {recentArticles.map((article: Article) => (
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
      )}

      {/* ===== 4) 내 댓글 탭 ===== */}
      {activeTab === "comment" && (
        <section className="comment-section">
          {/* 상단 제목 + 정렬 + 전체 삭제 */}
          <div className="comment-header-row">
            <div className="comment-title-block">
              <h2 className="comment-title">
                작성한 댓글
                <span className="comment-count">
                  {" "}
                  {myComments.length}개
                </span>
              </h2>

              <div className="comment-sort-tabs">
                <button
                  type="button"
                  className={`comment-sort-tab ${
                    commentSort === "created" ? "active" : ""
                  }`}
                  onClick={() => setCommentSort("created")}
                >
                  작성순
                </button>
                <button
                  type="button"
                  className={`comment-sort-tab ${
                    commentSort === "reaction" ? "active" : ""
                  }`}
                  onClick={() => setCommentSort("reaction")}
                >
                  반응 순
                </button>
              </div>
            </div>

            <button
              type="button"
              className="comment-clear"
              onClick={handleClearAllComments}
            >
              전체 삭제
            </button>
          </div>

          {/* 리스트 */}
          {sortedComments.length === 0 ? (
            <div className="bookmark-empty">
              작성한 댓글이 없습니다.
              <br />
              기사 상세 페이지에서 댓글을 남기면 이곳에서 모아볼 수 있습니다.
            </div>
          ) : (
            <ul className="bookmark-list comment-list">
              {sortedComments.map((item) => (
                <li key={item.id} className="bookmark-item comment-item">
                  <div className="bookmark-thumb">
                    {item.articleThumbUrl ? (
                      <img
                        src={item.articleThumbUrl}
                        alt={item.articleTitle}
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
                      {item.articleTitle}
                    </div>

                    <div className="comment-text">{item.text}</div>

                    <div className="bookmark-meta">
                      <span>{item.commentedAt}</span>
                    </div>

                    <div className="bookmark-stats">
                      <span>좋아요 {item.likeCount}</span>
                      <span>싫어요 {item.dislikeCount}</span>
                      <button
                        type="button"
                        className="bookmark-delete"
                        onClick={() => handleDeleteOneComment(item.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 노란 박스 안내 문구 */}
          <div className="bookmark-footer comment-footer">
            작성한 댓글이 10개를 넘으면 페이지를 나눠서 보여줄 예정입니다
            (임시 안내 문구).
          </div>
        </section>
      )}
    </div>
  );
}
