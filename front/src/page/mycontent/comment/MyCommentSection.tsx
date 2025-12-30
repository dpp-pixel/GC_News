// src/page/mycontent/comment/MyCommentSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client"; // axios 인스턴스
import "./MyCommentSection.css";

interface CommentItem {
  commentId: number;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  articleId: number;
  articleTitle: string;
  articleImageUrl?: string;
}

type CommentSortKey = "created" | "reaction";

export default function MyCommentSection() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("created");
  const [totalComments, setTotalComments] = useState(0);
  const navigate = useNavigate();

  // 댓글 가져오기 (한 번만)
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get<CommentItem[]>("/comments", {
        params: { page: 0, size: 10 }, // 첫 페이지만 가져오기
      });
      setComments(res.data);
    } catch (e) {
      console.error("댓글 로딩 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // 총 댓글 수
  useEffect(() => {
    const fetchTotalComments = async () => {
      try {
        const res = await api.get<number>("/comments/count");
        setTotalComments(res.data);
      } catch (error) {
        console.error("총 댓글 수 로딩 실패", error);
      }
    };
    fetchTotalComments();
  }, []);

  // 댓글 삭제
  const handleDeleteOneComment = async (id: number) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.commentId !== id));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 댓글 클릭 시 본문 이동
  const handleClickComment = (articleId: number, commentId: number) => {
    navigate(`/news/${articleId}#comment-${commentId}`);
  };

  // 정렬
  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === "created") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const aScore = a.likeCount + a.dislikeCount;
    const bScore = b.likeCount + b.dislikeCount;
    return bScore - aScore;
  });

  return (
    <section className="comment-section">
      <div className="comment-header-row">
        <div className="comment-title-block">
          <h2 className="comment-title">
            작성한 댓글 <span>{totalComments}개</span>
          </h2>

          <div className="comment-sort-tabs">
            <button
              type="button"
              className={`comment-sort-tab ${commentSort === "created" ? "active" : ""}`}
              onClick={() => setCommentSort("created")}
            >
              작성순
            </button>
            <button
              type="button"
              className={`comment-sort-tab ${commentSort === "reaction" ? "active" : ""}`}
              onClick={() => setCommentSort("reaction")}
            >
              반응 순
            </button>
          </div>
        </div>

        <button type="button" className="comment-clear" onClick={() => setComments([])}>
          전체 삭제
        </button>
      </div>

      {sortedComments.length === 0 && !loading && (
        <div className="bookmark-empty">
          작성한 댓글이 없습니다.
          <br />
          기사 상세 페이지에서 댓글을 남기면 이곳에서 모아볼 수 있습니다.
        </div>
      )}

      <ul className="bookmark-list comment-list">
        {sortedComments.map((item) => {
  const imageUrl = item.articleImageUrl || null;

  return (
    <li key={item.commentId} className="bookmark-item comment-item">
      <div className="bookmark-thumb">
        {imageUrl ? (
          <img src={imageUrl} alt={item.articleTitle || "기사"} />
        ) : (
          <div className="no-image-box">이미지 없음</div>
        )}
      </div>

      <div className="bookmark-info">
        <div
          className="bookmark-title"
          onClick={() => handleClickComment(item.articleId, item.commentId)}
          style={{ cursor: "pointer" }}
        >
          {item.articleTitle || "제목 없음"}
        </div>

        <div className="comment-text">{item.content}</div>
        <div className="bookmark-meta">{new Date(item.createdAt).toLocaleString()}</div>

        <div className="bookmark-stats">
          <span>좋아요 {item.likeCount}</span>
          <span>싫어요 {item.dislikeCount}</span>
          <button
            type="button"
            className="bookmark-delete"
            onClick={() => handleDeleteOneComment(item.commentId)}
          >
            삭제
          </button>
        </div>
      </div>
    </li>
  );
})}
      </ul>

      {loading && <div>로딩 중...</div>}
    </section>
  );
}
