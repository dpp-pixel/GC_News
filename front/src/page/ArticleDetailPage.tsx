import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ArticleDetailPage.css";

interface Article {
  articleId: number;
  title: string;
  content: string | null;
  press: string;
  publishedAt: string;
  viewCount: number;
  mediaList?: {
    url: string;
    mediaType: string;
  }[];
}

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;

    axios
      .get<Article>(`http://localhost:8081/api/articles/${articleId}`)
      .then((res) => setArticle(res.data))
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) return <p className="article-loading">로딩중...</p>;
  if (!article) return <p className="article-error">기사를 찾을 수 없습니다.</p>;

  return (
    <main className="article-detail">
      {/* 제목 */}
      <h1 className="article-title">{article.title}</h1>

      {/* 메타 정보 */}
      <div className="article-meta">
        {article.press} ·{" "}
        {new Date(article.publishedAt).toLocaleString()} · 조회수{" "}
        {article.viewCount ?? 0}
      </div>

      {/* 대표 이미지 */}
      {article.mediaList?.[0]?.url ? (
        <div className="article-image">
          <img
            src={article.mediaList[0].url.split("?")[0]}
            alt={article.title}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="article-image no-image">
          <span>이미지 없음</span>
        </div>
      )}

      {/* 본문 */}
      <article className="article-content">
        {article.content ? article.content : "본문 내용이 제공되지 않는 기사입니다."}
      </article>

      {/* 좋아요 / 싫어요 */}
      <section className="article-actions">
        <button>👍 좋아요</button>
        <button>👎 싫어요</button>
      </section>

      {/* 댓글 자리 */}
      <section className="article-comments">
        <h3>댓글</h3>
        <p>댓글 기능 예정</p>
      </section>
    </main>
  );
}
