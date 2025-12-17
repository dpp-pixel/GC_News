import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Article {
  articleId: number;
  title: string;
  content: string | null;
  press: string;
  publishedAt: string;
  mediaList?: { url: string }[];
}

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!articleId) return;

    axios
      .get<Article>(`http://localhost:8081/api/articles/${articleId}`)
      .then((res) => setArticle(res.data))
      .catch(console.error);
  }, [articleId]);

  if (!article) return <p>불러오는 중...</p>;

  return (
    <main style={{ width: "800px", margin: "0 auto" }}>
      <h1>{article.title}</h1>
      <p style={{ color: "#777", fontSize: "14px" }}>
        {article.press} · {new Date(article.publishedAt).toLocaleString()}
      </p>

      {/* 대표 이미지 */}
      {article.mediaList?.[0]?.url && (
        <img
          src={article.mediaList[0].url}
          alt=""
          style={{ width: "100%", margin: "20px 0" }}
        />
      )}

      {/* 기사 본문 */}
      <div style={{ lineHeight: 1.7, fontSize: "16px" }}>
        {article.content ?? "본문 준비중"}
      </div>

      {/* 👍 좋아요 / 👎 싫어요 자리 */}
      <section style={{ marginTop: "40px" }}>
        <button>👍 좋아요</button>
        <button style={{ marginLeft: "10px" }}>👎 싫어요</button>
      </section>

      {/* 💬 댓글 자리 */}
      <section style={{ marginTop: "40px" }}>
        <h3>댓글</h3>
        <p>댓글 기능 준비중</p>
      </section>
    </main>
  );
}
