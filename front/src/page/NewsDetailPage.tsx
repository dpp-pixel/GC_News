// src/page/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
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



export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 북마크 상태 전용 state
  const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);


  //기사 이동시 최 상단으로 이동
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
        <h1 className="title">{article.title}</h1>

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

          {/* ✅ 북마크 버튼 */}
          {isBookmarked !== null && (
            <button
              className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
            >
              {isBookmarked ? "북마크 취소" : "북마크"}
            </button>
          )}
        </div>
      </header>

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

      <ArticleReaction articleId={article.articleId} />
      <ArticleComments articleId={article.articleId} />
    </article>
     </div>
  );
}
