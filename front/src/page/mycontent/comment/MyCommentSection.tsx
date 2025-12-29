// src/page/mycontent/comment/MyCommentSection.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyCommentSection.css";

interface CommentItem {
  commentId: number;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  article?: {
    articleId: number;
    title: string;
    mediaList?: { url: string }[];
  };
}

type CommentSortKey = "created" | "reaction";

export default function MyCommentSection() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("created");
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get<CommentItem[]>("/api/users/me/comments", {
        params: { page, size: 10 },
      });

      setComments((prev) => [...prev, ...res.data]);
      setHasMore(res.data.length === 10);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error("댓글 로딩 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    fetchComments();
  }, []);

  const lastCommentRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchComments();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchComments]
  );

  const handleDeleteOneComment = async (id: number) => {
    try {
      await axios.delete(`/api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.commentId !== id));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleClickComment = (articleId: number, commentId: number) => {
    navigate(`/news/${articleId}#comment-${commentId}`);
  };

  useEffect(() => {
  const fetchTotalComments = async () => {
    try {
      const res = await axios.get<number>("/api/users/me/comments/count");
      setTotalComments(res.data);
    } catch (error) {
      console.error("총 댓글 수 로딩 실패", error);
    }
  };

  fetchTotalComments();
}, []);

  const sortedComments = [...comments]
    .filter((c) => c.article) // article 없는 경우 제외
    .sort((a, b) => {
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
            작성한 댓글 <span>{comments.length}개</span>
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

        <button
          type="button"
          className="comment-clear"
          onClick={() => setComments([])}
        >
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
        {sortedComments.map((item, idx) => {
          const isLast = idx === sortedComments.length - 1;
          const imageUrl = item.article?.mediaList?.[0]?.url || null;

          return (
            <li
              key={item.commentId}
              ref={isLast ? lastCommentRef : null}
              className="bookmark-item comment-item"
            >
              <div className="bookmark-thumb">
                {imageUrl ? (
                  <img src={imageUrl} alt={item.article?.title || "기사"} />
                ) : (
                  <div className="no-image-box">이미지 없음</div>
                )}
              </div>

              <div className="bookmark-info">
                <div
                  className="bookmark-title"
                  onClick={() =>
                    handleClickComment(item.article!.articleId, item.commentId)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {item.article?.title || "제목 없음"}
                </div>

                <div className="comment-text">{item.content}</div>
                <div className="bookmark-meta">
                  {new Date(item.createdAt).toLocaleString()}
                </div>

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
