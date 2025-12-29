// src/page/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const res = await axios.get<ArticleDetail>(
          `http://localhost:8081/api/articles/${id}`
        );
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

  if (loading) {
    return <div className="news-loading">기사 불러오는 중...</div>;
  }

  if (error) {
    return <div className="news-loading">{error}</div>;
  }

  if (!article) {
    return (
      <div className="news-loading">
        기사 데이터를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    // ✅ 헤더 + 고정 카테고리바만큼 위 여백을 주는 래퍼
    <div className="news-detail-page">
      <article className="news-detail">
        {/* 상단 헤더 영역 */}
        <header className="article-header">
          <div className="press">{article.press}</div>

          <h1 className="title">{article.title}</h1>

          <div className="meta">
            {article.reporterName && (
              <span className="reporter">{article.reporterName} 기자</span>
            )}
            <span className="date">
              입력 {new Date(article.publishedAt).toLocaleString()}
            </span>
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

        {/* 반응 / 댓글 */}
        <ArticleReaction articleId={article.articleId} />
        <ArticleComments articleId={article.articleId} />
      </article>
    </div>
  );
}
