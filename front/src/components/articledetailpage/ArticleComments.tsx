import { useEffect, useState } from "react";
import axios from "axios";
import "./ArticleComments.css";

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
}

interface Props {
  articleId: number;
}

/* 임시 유저 키 (로그인 전) */
const getUserKey = () => {
  let key = localStorage.getItem("userKey");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("userKey", key);
  }
  return key;
};

export default function ArticleComments({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [bestComments, setBestComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  /* 댓글 목록 */
  const fetchComments = () => {
    axios
      .get<Comment[]>(`http://localhost:8081/api/comments/article/${articleId}`)
      .then(res => setComments(res.data));
  };

  /* 베스트 댓글 */
  const fetchBestComments = () => {
    axios
      .get<Comment[]>(
        `http://localhost:8081/api/comments/article/${articleId}/best`
      )
      .then(res => setBestComments(res.data));
  };

  useEffect(() => {
    fetchComments();
    fetchBestComments();
  }, [articleId]);

  /* 댓글 작성 */
  const submitComment = async () => {
    if (!newComment.trim()) return;

    await axios.post(
      `http://localhost:8081/api/comments?articleId=${articleId}`,
      { content: newComment },
      { headers: { "Content-Type": "application/json" } }
    );

    setNewComment("");
    fetchComments();
    fetchBestComments();
  };

  /* 댓글 삭제 */
  const deleteComment = async (commentId: number) => {
    if (!window.confirm("삭제 하시겠습니까?")) return;

    await axios.delete(`http://localhost:8081/api/comments/${commentId}`);

    setComments(prev =>
      prev.filter(comment => comment.commentId !== commentId)
    );
  };

  /* 댓글 좋아요 / 싫어요 */
  const reactComment = async (
    commentId: number,
    type: "like" | "dislike"
  ) => {
    const userKey = getUserKey();

    await axios.post(
      "http://localhost:8081/api/comments/reactions",
      null,
      {
        params: { commentId, userKey, type },
      }
    );

    fetchComments();
    fetchBestComments();
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
