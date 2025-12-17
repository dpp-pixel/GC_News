import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
      .then((res) => {
        setArticle(res.data);
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) return <p>로딩중...</p>;
  if (!article) return <p>기사를 찾을 수 없습니다.</p>;

  return (
    <main style={{ width: "800px", margin: "40px auto" }}>
      {/* 제목 */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        {article.title}
      </h1>

      {/* 메타 정보 */}
      <div style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
        {article.press} ·{" "}
        {new Date(article.publishedAt).toLocaleString()} · 조회수{" "}
        {article.viewCount ?? 0}
      </div>

      {/* 대표 이미지 */}
      {article.mediaList?.[0]?.url && (
        <img
          src={article.mediaList[0].url}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            marginBottom: "20px",
          }}
        />
      )}

      {/* 기사 본문 */}
      <article style={{ fontSize: "16px", lineHeight: "1.7" }}>
        {article.content ? (
          article.content
        ) : (
          <p>본문 내용이 제공되지 않는 기사입니다.</p>
        )}
      </article>

      {/* 좋아요 / 싫어요 자리 */}
      <section style={{ marginTop: "40px" }}>
        <button>👍 좋아요</button>
        <button style={{ marginLeft: "10px" }}>👎 싫어요</button>
      </section>

      {/* 댓글 자리 */}
      <section style={{ marginTop: "40px" }}>
        <h3>댓글</h3>
        <p>댓글 기능 예정</p>
      </section>
    </main>
  );
}
