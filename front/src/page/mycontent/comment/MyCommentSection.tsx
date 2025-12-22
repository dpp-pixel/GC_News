// src/page/mycontent/comment/MyCommentSection.tsx
import { useState } from "react";
import "./MyCommentSection.css";

interface MyCommentItem {
  id: number;
  articleTitle: string;
  articleThumbUrl: string;
  commentedAt: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
}

/** UI 확인용 더미 데이터 */
const MOCK_COMMENTS: MyCommentItem[] = [
  {
    id: 1,
    articleTitle:
      "김 총리 “이재명 정부 5년 짧다더라… 더 했으면 좋겠다는 분도”",
    articleThumbUrl:
      "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    commentedAt: "2025.12.19 오후 10:30",
    text: "방금 전 ;;",
    likeCount: 12,
    dislikeCount: 1,
  },
  {
    id: 2,
    articleTitle:
      "국방장관 ‘게임땐 대업 간부 징계’ 보도에 “알려진 내용과 달라”",
    articleThumbUrl:
      "https://mimgnews.pstatic.net/image/005/2025/12/19/0000000000.jpg?type=nf220_150",
    commentedAt: "2025.12.18 오후 3:12",
    text: "이 부분은 자료를 더 보고 판단해야 할 것 같네요.",
    likeCount: 5,
    dislikeCount: 0,
  },
  {
    id: 3,
    articleTitle:
      "[속보] 李 “남북, 과거엔 원수인척… 이젠 진짜 원수된 느낌”",
    articleThumbUrl:
      "https://mimgnews.pstatic.net/image/021/2025/12/19/0000000000.jpg?type=nf220_150",
    commentedAt: "2025.12.17 오전 9:05",
    text: "표현이 너무 자극적인 것 같습니다.",
    likeCount: 3,
    dislikeCount: 2,
  },
];

type CommentSortKey = "created" | "reaction";

export default function MyCommentSection() {
  const [myComments, setMyComments] =
    useState<MyCommentItem[]>(MOCK_COMMENTS);
  const [commentSort, setCommentSort] =
    useState<CommentSortKey>("created");

  const sortedComments = [...myComments].sort((a, b) => {
    if (commentSort === "created") {
      return (
        new Date(b.commentedAt).getTime() -
        new Date(a.commentedAt).getTime()
      );
    }
    const aScore = a.likeCount + a.dislikeCount;
    const bScore = b.likeCount + b.dislikeCount;
    return bScore - aScore;
  });

  const handleClearAllComments = () => {
    if (myComments.length === 0) return;
    if (window.confirm("작성한 댓글을 모두 삭제하시겠습니까?")) {
      setMyComments([]);
    }
  };

  const handleDeleteOneComment = (id: number) => {
    setMyComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="comment-section">
      <div className="comment-header-row">
        <div className="comment-title-block">
          <h2 className="comment-title">
            작성한 댓글
            <span className="comment-count">
              {" "}
              {myComments.length}개
            </span>
          </h2>

          <div className="comment-sort-tabs">
            <button
              type="button"
              className={`comment-sort-tab ${
                commentSort === "created" ? "active" : ""
              }`}
              onClick={() => setCommentSort("created")}
            >
              작성순
            </button>
            <button
              type="button"
              className={`comment-sort-tab ${
                commentSort === "reaction" ? "active" : ""
              }`}
              onClick={() => setCommentSort("reaction")}
            >
              반응 순
            </button>
          </div>
        </div>

        <button
          type="button"
          className="comment-clear"
          onClick={handleClearAllComments}
        >
          전체 삭제
        </button>
      </div>

      {sortedComments.length === 0 ? (
        <div className="bookmark-empty">
          작성한 댓글이 없습니다.
          <br />
          기사 상세 페이지에서 댓글을 남기면 이곳에서 모아볼 수 있습니다.
        </div>
      ) : (
        <ul className="bookmark-list comment-list">
          {sortedComments.map((item) => (
            <li
              key={item.id}
              className="bookmark-item comment-item"
            >
              <div className="bookmark-thumb">
                {item.articleThumbUrl ? (
                  <img
                    src={item.articleThumbUrl}
                    alt={item.articleTitle}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add(
                        "no-image"
                      );
                    }}
                  />
                ) : (
                  <div className="no-image-box">이미지 없음</div>
                )}
              </div>

              <div className="bookmark-info">
                <div className="bookmark-title">
                  {item.articleTitle}
                </div>

                <div className="comment-text">{item.text}</div>

                <div className="bookmark-meta">
                  <span>{item.commentedAt}</span>
                </div>

                <div className="bookmark-stats">
                  <span>좋아요 {item.likeCount}</span>
                  <span>싫어요 {item.dislikeCount}</span>
                  <button
                    type="button"
                    className="bookmark-delete"
                    onClick={() =>
                      handleDeleteOneComment(item.id)
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="bookmark-footer comment-footer">
        작성한 댓글이 10개를 넘으면 페이지를 나눠서 보여줄 예정입니다
        (임시 안내 문구).
      </div>
    </section>
  );
}
