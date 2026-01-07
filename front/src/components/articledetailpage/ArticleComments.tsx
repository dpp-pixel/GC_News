import { useEffect, useState } from "react";
import { api } from "../../api/client"; 
import "./ArticleComments.css";
import { isLoggedIn } from "../../auth/auth";

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  userName?: string;
}

interface Props {
  articleId: number;
}

export default function ArticleComments({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [bestComments, setBestComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  /* 댓글 목록 */
  const fetchComments = async () => {
    try {
      const res = await api.get<Comment[]>(`/comments/article/${articleId}`);
      setComments(res.data);
    } catch (e: any) {
      console.error("댓글 조회 실패:", e);
      alert(e.response?.data || "댓글 조회 실패");
    }
  };

  /* 베스트 댓글 */
  const fetchBestComments = async () => {
    try {
      const res = await api.get<Comment[]>(`/comments/article/${articleId}/best`);
      setBestComments(res.data);
    } catch (e: any) {
      console.error("베스트 댓글 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchComments();
    fetchBestComments();
  }, [articleId]);

  /* 댓글 작성 */
  const submitComment = async () => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await api.post(`/comments?articleId=${articleId}`, { content: newComment });
      setNewComment("");
      fetchComments();
      fetchBestComments();
    } catch (e: any) {
      console.error("댓글 작성 실패:", e);
      alert(e.response?.data || "댓글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* 댓글 삭제 */
  const deleteComment = async (commentId: number) => {
    if (!window.confirm("삭제 하시겠습니까?")) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.commentId !== commentId));
      fetchBestComments();
    } catch (e: any) {
      console.error("댓글 삭제 실패:", e);
      alert(e.response?.data || "댓글 삭제에 실패했습니다.");
    }
  };

  /* 댓글 좋아요 / 싫어요 */
  const reactComment = async (commentId: number, type: "like" | "dislike") => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 댓글에서 like/dislike만 허용
    if (type !== "like" && type !== "dislike") {
      alert("댓글에서는 like 또는 dislike만 가능합니다.");
      return;
    }

    try {
      await api.post(`/comments/reactions`, null, { params: { commentId, type } });
      fetchComments();
      fetchBestComments();
    } catch (e: any) {
      console.error("댓글 반응 실패:", e);
      alert(e.response?.data || "댓글 반응 실패");
    }
  };

  return (
    <section className="article-comments">
      {/* 베스트 댓글 */}
      {bestComments.length > 0 && (
        <section className="best-comments">
          <h3>베스트 댓글</h3>
          <ul className="comment-list best">
            {bestComments.map(c => (
              <li key={c.commentId}>
                {c.userName && <p className="comment-author">{c.userName}</p>}
                <p className="comment-content">{c.content}</p>
                <div className="comment-footer">
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <span>👍 {c.likeCount}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 댓글 작성 */}
      <h3>댓글 {comments.length}</h3>
      <div className="comment-form">
        <textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={submitComment} disabled={loading}>
          등록
        </button>
      </div>

      {/* 댓글 목록 */}
      <ul className="comment-list">
        {comments.map(c => (
          <li key={c.commentId}>
            {c.userName && <p className="comment-author">{c.userName}</p>}
            <p className="comment-content">{c.content}</p>
            <div className="comment-footer">
              <span className="comment-date">
                {new Date(c.createdAt).toLocaleString()}
              </span>
              <div className="comment-actions">
                <button onClick={() => reactComment(c.commentId, "like")}>
                  👍 {c.likeCount}
                </button>
                <button onClick={() => reactComment(c.commentId, "dislike")}>
                  👎 {c.dislikeCount}
                </button>
                <button
                  className="comment-delete"
                  onClick={() => deleteComment(c.commentId)}
                >
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
