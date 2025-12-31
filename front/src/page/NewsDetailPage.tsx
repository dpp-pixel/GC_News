import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./NewsDetailPage.css";
import ArticleReaction from "../components/articledetailpage/ArticleReaction";
import ArticleComments from "../components/articledetailpage/ArticleComments";
import ReporterAssetm from "@/components/reporter/ReporterAssetm";

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
  <div className="article-detail-layout">
    {/* 왼쪽: 기자 에셋 */}
    {article.reporter && (
      <aside style={{ marginBottom: 24 }}>
        <ReporterAssetm reporter={article.reporter} />
      </aside>
    )}

    {/* 오른쪽: 기사 본문 */}
    <article className="news-detail">
      {/* 상단 헤더 영역 */}
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
