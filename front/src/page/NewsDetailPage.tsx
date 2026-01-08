// src/page/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import "./NewsDetailPage.css";

import ArticleReaction from "../components/articledetailpage/ArticleReaction";
import ArticleComments from "../components/articledetailpage/ArticleComments";
import ReporterAssetm from "@/components/reporter/ReporterAssetm";
import { isLoggedIn, requireLogin } from "../auth/auth";
import Loading from "../components/common/loading/Loading";

interface Media {
  url: string;
  mediaType: string;
}

interface ReporterSummary {
  reporterId: number;
  name: string;
  profileImageUrl?: string | null;
  press: string;
  subscriberCount?: number;
  recommendationCount?: number;
}

interface ArticleDetail {
  articleId: number;
  title: string;
  press: string;
  publishedAt: string;
  contentHtml?: string | null;
  mediaList?: Media[];
  reporterName?: string | null;
  reporter?: ReporterSummary | null;
}

interface ArticleSummary {
  summaryId: number;
  summaryText: string;
  score: number | null;
  createdAt: string;
}

/* ===============================
   AI 요약 텍스트 파싱 유틸
   =============================== */

type ParsedScore = {
  label: string;
  value: number;
  max: number;
  rate: number; // 0~100
};

function parseSummaryText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const idx1 = lines.findIndex((l) => l.startsWith("1)"));
  const idx2 = lines.findIndex((l) => l.startsWith("2)"));
  const idx3 = lines.findIndex((l) => l.startsWith("3)"));

  // 1) 이후 ~ 2) 이전을 요약으로 사용
  let summaryLines: string[] = [];
  if (idx1 !== -1) {
    const end = idx2 !== -1 ? idx2 : idx3 !== -1 ? idx3 : lines.length;
    summaryLines = lines
      .slice(idx1 + 1, end)
      .map((l) => l.replace(/^-+\s*/, ""));
  }

  // 2) 이후 ~ 3) 이전 한 줄을 핵심 포인트로 사용
  let keyPointLine = "";
  if (idx2 !== -1) {
    const end = idx3 !== -1 ? idx3 : lines.length;
    const after2 = lines.slice(idx2 + 1, end);
    keyPointLine = after2[0] ?? "";
  }

  // 평가 등급 텍스트(점수용)
  let evaluationText = "";
  const idxEval = lines.findIndex((l) => l.includes("평가 등급"));
  if (idxEval !== -1) {
    evaluationText = lines.slice(idxEval).join(" ");
  }

  return { summaryLines, keyPointLine, evaluationText };
}

function parseScores(evaluationText: string): ParsedScore[] {
  const scores: ParsedScore[] = [];
  if (!evaluationText) return scores;

  const regex =
    /([가-힣A-Za-z·\s\[\]A-Z]+?):\s*(\d+)\s*\/\s*(\d+)점/g;

  let m: RegExpExecArray | null;
  while ((m = regex.exec(evaluationText)) !== null) {
    const label = m[1].trim();
    const value = Number(m[2]);
    const max = Number(m[3]);
    if (!max) continue;
    const rate = Math.min(100, Math.round((value / max) * 100));
    scores.push({ label, value, max, rate });
  }

  return scores;
}

/* ===============================
   실제 페이지 컴포넌트
   =============================== */

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크 상태
  const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // AI 요약 상태
  const [aiSummary, setAiSummary] = useState<ArticleSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 기사 이동 시 최상단으로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

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
    if (!requireLogin(navigate)) {
      return;
    }

    const prev = isBookmarked;

    try {
      setBookmarkLoading(true);
      // optimistic update
      setIsBookmarked((p) => !p);
      await api.post(`/bookmarks/toggle/${id}`);
    } catch (e) {
      console.error("북마크 토글 실패:", e);
      setIsBookmarked(prev ?? false); // rollback
    } finally {
      setBookmarkLoading(false);
    }
  };

  /* ===============================
     AI 요약 호출
     =============================== */
  const handleAiSummary = async () => {
    if (!requireLogin(navigate)) {
      return;
    }
    if (!id) return;

    try {
      setAiLoading(true);
      setAiError(null);

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
  if (loading) return <Loading text="기사 불러오는 중" />;
  if (error) return <div className="news-loading">{error}</div>;
  if (!article)
    return <div className="news-loading">기사 데이터를 찾을 수 없습니다.</div>;

  // AI 요약 파싱 (요약 / 핵심포인트 / 점수)
  const parsed =
    aiSummary != null ? parseSummaryText(aiSummary.summaryText) : null;
  const parsedScores =
    aiSummary != null ? parseScores(parsed?.evaluationText ?? "") : [];

  // 기자 에셋에 사용할 데이터 (reporter 없으면 reporterName으로 임시 생성)
  const reporterForCard: ReporterSummary | null = article.reporter
    ? article.reporter
    : article.reporterName
    ? {
        reporterId: 0,
        name: article.reporterName,
        press: article.press,
        profileImageUrl: null,
      }
    : null;

  return (
    <div className="article-detail-layout">
      {/* 왼쪽: 기자 에셋 */}
      {reporterForCard && (
        <aside style={{ marginBottom: 24 }}>
          <ReporterAssetm reporter={reporterForCard} />
        </aside>
      )}

      {/* 오른쪽: 기사 본문 */}
      <article className="news-detail">
        {/* 헤더 */}
        <header className="article-header">
          <div className="press">{article.press}</div>
          <h1 className="title">
            {article.title}
            {/* AI 점수 뱃지 (제목 옆) */}
            {aiSummary?.score != null && (
              <span className="ai-score-badge">
                AI 평가 {aiSummary.score}점
              </span>
            )}
          </h1>

          <div className="meta">
            {/* reporter 객체 > reporterName 문자열 */}
            {article.reporter?.name && (
              <span className="reporter">{article.reporter.name} 기자</span>
            )}
            {!article.reporter?.name && article.reporterName && (
              <span className="reporter">{article.reporterName} 기자</span>
            )}

            <span className="date">
              입력 {new Date(article.publishedAt).toLocaleString()}
            </span>

            {/* 북마크 버튼 */}
            {isBookmarked !== null && (
              <button
                className={`bookmark-btn ${
                  isBookmarked ? "active" : ""
                }`}
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
              >
                {isBookmarked ? "북마크 취소" : "북마크"}
              </button>
            )}

            {/* AI 요약 버튼 */}
            <button
              className="ai-summary-btn"
              onClick={handleAiSummary}
              disabled={aiLoading}
            >
              {aiLoading ? "AI 요약 중..." : "AI 요약"}
            </button>
          </div>
        </header>

        {/* AI 요약 에러 */}
        {aiError && <div className="ai-summary-error">{aiError}</div>}

        {/* AI 요약 카드 */}
        {aiSummary && parsed && (
          <section className="ai-summary-card">
            {/* 상단 헤더 */}
            <div className="ai-card-header">
              <div className="ai-card-title">AI 요약</div>
              {aiSummary.score != null && (
                <div className="ai-score-circle">
                  <span className="ai-score-main">
                    {aiSummary.score}
                  </span>
                  <span className="ai-score-sub">/ 100</span>
                </div>
              )}
            </div>

            {/* 요약 / 핵심 포인트 */}
            <div className="ai-summary-body">
              <div className="ai-summary-block">
                <div className="ai-section-label">요약</div>
                <ul className="ai-summary-list">
                  {parsed.summaryLines.length > 0 ? (
                    parsed.summaryLines.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))
                  ) : (
                    <li>요약 문장을 분석 중입니다.</li>
                  )}
                </ul>
              </div>

              <div className="ai-summary-block">
                <div className="ai-section-label">핵심 포인트</div>
                <p className="ai-key-point">
                  {parsed.keyPointLine ||
                    "핵심 포인트를 분석 중입니다."}
                </p>
              </div>
            </div>

            {/* 점수 막대 그래프 */}
            {parsedScores.length > 0 && (
              <div className="ai-score-detail">
                <div className="ai-score-title">AI 평가 세부 점수</div>
                <div className="ai-score-bars">
                  {parsedScores.map((s) => (
                    <div className="ai-score-row" key={s.label}>
                      <div className="ai-score-label">{s.label}</div>
                      <div className="ai-score-bar-track">
                        <div
                          className="ai-score-bar-fill"
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <div className="ai-score-value">
                        {s.value}/{s.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="ai-card-footer">
              생성 시각:{" "}
              {new Date(aiSummary.createdAt).toLocaleString()}
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

        {/* 반응 / 댓글 */}
        <ArticleReaction articleId={article.articleId} />
        <ArticleComments articleId={article.articleId} />
      </article>
    </div>
  );
}
