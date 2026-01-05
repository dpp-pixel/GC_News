// src/page/NewsDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import "./NewsDetailPage.css";

import ArticleReaction from "../components/articledetailpage/ArticleReaction";
import ArticleComments from "../components/articledetailpage/ArticleComments";

// ✅ 기자 카드
import ReporterCard, {
  type ReporterInfo,
} from "../components/reporter/ReporterCard";

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

// 임시 더미 기자 정보 (나중에 API 연동 시 교체)
const DUMMY_REPORTER: ReporterInfo = {
  id: 1,
  name: "김기덕 기자",
  email: "reporter1@news.com",
  subscribers: 80,
  recommends: 3,
  tags: ["정치부", "분석"],
  trustScore: 70,
  imageUrl: "https://picsum.photos/150",
};

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
    <div className="news-detail-page-wrapper">
      <div className="news-detail-main-wrapper">
        {/* ✅ 왼쪽 기자 카드 (기사 페이지 전용) */}
        <aside className="reporter-card-column">
          <ReporterCard info={DUMMY_REPORTER} />
        </aside>

        {/* ✅ 오른쪽 기사 영역 */}
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

          {/* 반응 / 댓글 컴포넌트 */}
          <ArticleReaction articleId={article.articleId} />
          <ArticleComments articleId={article.articleId} />
        </article>
      </div>
    </div>
  );
}
