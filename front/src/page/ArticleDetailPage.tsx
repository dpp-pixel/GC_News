import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ArticleDetailPage.css";

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
}

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  /* 기사 상세 */
  useEffect(() => {
    if (!articleId) return;

    axios
      .get<Article>(`http://localhost:8081/api/articles/${articleId}`)
      .then(res => setArticle(res.data))
      .finally(() => setLoading(false));
  }, [articleId]);

  /* 댓글 목록 */
  const fetchComments = () => {
    if (!articleId) return;

    axios
      .get<Comment[]>(`http://localhost:8081/api/comments/article/${articleId}`)
      .then(res => setComments(res.data));
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  /* 댓글 작성 */
  const submitComment = async () => {
    if (!newComment.trim() || !articleId) return;

    await axios.post(
  `http://localhost:8081/api/comments?articleId=${articleId}`,
  { content: newComment },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

    setNewComment("");
    fetchComments();
  };

  const deleteComment = async (commentId: number) => {
  if (!window.confirm("삭제 하시겠습니까.")) return;

  await axios.delete(`http://localhost:8081/api/comments/${commentId}`);

  setComments(prev =>
    prev.filter(comment => comment.commentId !== commentId)
  );
};

  

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
        {article.content ?? "본문 내용이 제공되지 않는 기사입니다."}
      </article>

      {/* 좋아요 / 싫어요 */}
      <section className="article-actions">
        <button>👍 좋아요</button>
        <button>👎 싫어요</button>
      </section>

      {/* 댓글 */}
      <section className="article-comments">
        <h3>댓글 {comments.length}</h3>

        {/* 댓글 작성 */}
        <div className="comment-form">
          <textarea
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={submitComment}>등록</button>
        </div>

        {/* 댓글 목록 */}
        <ul className="comment-list">
  {comments.map(c => (
    <li key={c.commentId}>
      <p className="comment-content">{c.content}</p>

      <div className="comment-footer">
        <span className="comment-date">
          {new Date(c.createdAt).toLocaleString()}
        </span>

        <button
          className="comment-delete"
          onClick={() => deleteComment(c.commentId)}
        >
          삭제
        </button>
      </div>
    </li>
  ))}
</ul>

      </section>
    </main>
  );
}
