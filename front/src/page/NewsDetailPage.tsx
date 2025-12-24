// src/page/news/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client"; // client.ts 인스턴스
import "./NewsDetailPage.css";
import ArticleReaction from "../components/articledetailpage/ArticleReaction";
import ArticleComments from "../components/articledetailpage/ArticleComments";

interface Media {
  url: string;
  mediaType: string;
}

interface ArticleDetail {
  articleId: number;
  title: string;
  press: string;
  reporterName?: string | null;
  publishedAt: string;
  contentHtml?: string | null;
  mediaList?: Media[];
  bookmarked?: boolean;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 기사 상세 가져오기
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
        console.error("detail API error:", e);
        setError("기사 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // 북마크 토글
  const toggleBookmark = async () => {
    if (!article) return;

    try {
      setBookmarkLoading(true);

      // 서버 호출 전 UI 바로 반영 (optimistic update)
      setArticle((prev) => prev && { ...prev, bookmarked: !prev.bookmarked });

      if (article.bookmarked) {
        await api.delete(`/bookmarks/toggle/${article.articleId}`);
      } else {
        await api.post(`/bookmarks/toggle/${article.articleId}`);
      }
    } catch (e) {
      console.error("북마크 토글 실패:", e);

      // 실패 시 원래 상태로 롤백
      setArticle((prev) => prev && { ...prev, bookmarked: article.bookmarked });
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) return <div className="news-loading">기사 불러오는 중...</div>;
  if (error) return <div className="news-loading">{error}</div>;
  if (!article) return <div className="news-loading">기사 데이터를 찾을 수 없습니다.</div>;

  return (
    <article className="news-detail">
      {/* 상단 헤더 영역 */}
      <header className="article-header">
        <div className="press">{article.press}</div>
        <h1 className="title">{article.title}</h1>
        <div className="meta">
          {article.reporterName && <span className="reporter">{article.reporterName} 기자</span>}
          <span className="date">입력 {new Date(article.publishedAt).toLocaleString()}</span>

          {/* 북마크 버튼 */}
          <button
            className={`bookmark-btn ${article.bookmarked ? "active" : ""}`}
            onClick={toggleBookmark}
            disabled={bookmarkLoading}
          >
            {article.bookmarked ? "북마크 취소" : "북마크"}
          </button>
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
        dangerouslySetInnerHTML={{ __html: article.contentHtml || "" }}
      />

      {/* 감정 반응 + 댓글 */}
      <ArticleReaction articleId={article.articleId} />
      <ArticleComments articleId={article.articleId} />
    </article>
  );
}
