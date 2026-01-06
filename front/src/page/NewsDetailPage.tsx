// src/page/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import axios from "axios";

import "./NewsDetailPage.css";

import ArticleReaction from "../components/articledetailpage/ArticleReaction";
import ArticleComments from "../components/articledetailpage/ArticleComments";
import ReporterAssetm from "@/components/reporter/ReporterAssetm";
import { isLoggedIn } from "../auth/auth";

interface Media {
  url: string;
  mediaType: string;
}

interface ReporterSummary {
  reporterId: number;
  name: string;
  profileImageUrl?: string | null;
  press: string;
}

interface ArticleDetail {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  contentHtml?: string | null;
  mediaList?: Media[];
  reporterName?: string | null;          // 백엔드가 아직 이 문자열을 줄 수도 있으니까 남겨두고
  reporter?: ReporterSummary | null;     //  새로 추가된 기자 객체
}

interface ArticleSummary {
  summaryId: number;
  summaryText: string;
  score: number | null;
  createdAt: string;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크 상태 전용 state
  const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);



  //기사 이동시 최 상단으로 이동
    useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  // ✅ AI 요약 state
  const [aiSummary, setAiSummary] = useState<ArticleSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  /* ===============================
     기사 상세 조회
  =============================== */
  useEffect(() => {
    if (!id) {
      setError("잘못된 기사 주소입니다.");
      setLoading(false);
      return;
    }
    

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ArticleDetail>(`/articles/${id}`);
        setArticle(res.data);
      } catch (e) {
        console.error("기사 상세 조회 실패:", e);
        setError("기사 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  /* ===============================
     북마크 상태 조회
  =============================== */
  useEffect(() => {
    if (!id || !isLoggedIn()) {
      setIsBookmarked(false);
      return;
    }

    const fetchBookmarkStatus = async () => {
      try {
        const res = await api.get<boolean>(`/bookmarks/status/${id}`);
        setIsBookmarked(res.data);
      } catch (e) {
        console.error("북마크 상태 조회 실패:", e);
        setIsBookmarked(false);
      }


    };

    fetchBookmarkStatus();
  }, [id]);

  /* ===============================
     북마크 토글
  =============================== */
  const toggleBookmark = async () => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }

    const prev = isBookmarked;

    try {
      setBookmarkLoading(true);

      // optimistic update
      setIsBookmarked((prev) => !prev);

      await api.post(`/bookmarks/toggle/${id}`);
    } catch (e) {
      console.error("북마크 토글 실패:", e);
      setIsBookmarked(prev ?? false); // rollback
    } finally {
      setBookmarkLoading(false);
    }
  };
  const handleAiSummary = async () => {
    if (!isLoggedIn()) {
      alert("AI 요약은 로그인 후 이용할 수 있습니다.");
      // 필요하면 여기서 로그인 페이지로 이동도 가능
      // window.location.href = "/login";
      return;
    }

    if (!id) return;

    try {
      setAiLoading(true);
      setAiError(null);

      // force=false -> 기존 요약이 있으면 재사용, 없으면 새로 생성
      const res = await api.post<ArticleSummary>(
        `/articles/${id}/ai-summary`,
        null,
        { params: { force: false } }
      );

      setAiSummary(res.data);
    } catch (e) {
      console.error("AI 요약 호출 실패:", e);
      setAiError("AI 요약을 불러오지 못했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ===============================
     렌더링 분기
  =============================== */
  if (loading) return <div className="news-loading">기사 불러오는 중...</div>;
  if (error) return <div className="news-loading">{error}</div>;
  if (!article)
    return <div className="news-loading">기사 데이터를 찾을 수 없습니다.</div>;




  return (

    <div className="article-detail-layout">
      {/* 왼쪽: 기자 에셋 */}
      {article.reporter && (
        <aside style={{ marginBottom: 24 }}>
          <ReporterAssetm reporter={article.reporter} />
        </aside>
      )}

      {/* 오른쪽: 기사 본문 */}
      <article className="news-detail">
        {/* 헤더 */}
        <header className="article-header">
          <div className="press">{article.press}</div>
          <h1 className="title">{article.title}

            {/*AI 점수 뱃지 */}
            {aiSummary?.score != null && (
              <span className="ai-score-badge">
                AI 평가 {aiSummary.score}점
              </span>
            )}
          </h1>

          <div className="meta">
            {/* 우선순위: reporter 객체 > reporterName 문자열 */}
            {article.reporter?.name && (
              <span className="reporter">{article.reporter.name} 기자</span>
            )}
            {!article.reporter?.name && article.reporterName && (
              <span className="reporter">{article.reporterName} 기자</span>
            )}

            <span className="date">
              입력 {new Date(article.publishedAt).toLocaleString()}
            </span>

            {/*  북마크 버튼 */}
            {isBookmarked !== null && (
              <button
                className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
              >
                {isBookmarked ? "북마크 취소" : "북마크"}
              </button>
            )}

            {/*  AI 요약 버튼 (로그인 체크는 핸들러에서 함) */}
            <button
              className="ai-summary-btn"
              onClick={handleAiSummary}
              disabled={aiLoading}
            >
              {aiLoading ? "AI 요약 중..." : "AI 요약"}
            </button>
          </div>
        </header>

        {/*  여기! 북마크/AI 버튼 바로 아래쪽에 표시 */}
        {aiError && <div className="ai-summary-error">{aiError}</div>}

        {aiSummary && (
          <section className="ai-summary-box">
            <h2>AI 요약</h2>
            <pre className="ai-summary-text">{aiSummary.summaryText}</pre>
            <div className="ai-summary-meta">
              생성 시각: {new Date(aiSummary.createdAt).toLocaleString()}
            </div>
          </section>
        )}

        {/* 대표 이미지 */}
        {article.mediaList?.[0]?.url && (
          <figure className="article-image">
            <img src={article.mediaList[0].url} alt={article.title} />
          </figure>
        )}

        {/* 본문 */}
        <section
          className="article-body"
          dangerouslySetInnerHTML={{
            __html: article.contentHtml || "",
          }}
        />

        {/* 반응 / 댓글 컴포넌트 */}
        <ArticleReaction articleId={article.articleId} />
        <ArticleComments articleId={article.articleId} />
      </article>
    </div>
  );
}
