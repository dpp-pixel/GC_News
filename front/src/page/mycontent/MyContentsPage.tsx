// src/page/mycontent/MyContentsPage.tsx
import { useState } from "react";
import "./MyContentsPage.css";

import MySubscribeSection from "./subscribe/MySubscribeSection";
import MyBookmarkSection from "./bookmark/MyBookmarkSection";
import MyRecentSection from "./recent/MyRecentSection";
import MyCommentSection from "./comment/MyCommentSection";

type TabKey = "subscribe" | "bookmark" | "recent" | "comment";

export default function MyContentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("subscribe");

  return (
    <div className="my-contents-page">
      {/* 상단 탭 */}
      <div className="my-tabs">
        <button
          className={`tab ${activeTab === "subscribe" ? "active" : ""}`}
          onClick={() => setActiveTab("subscribe")}
        >
          내 구독
        </button>
        <button
          className={`tab ${activeTab === "bookmark" ? "active" : ""}`}
          onClick={() => setActiveTab("bookmark")}
        >
          북마크
        </button>
        <button
          className={`tab ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => setActiveTab("recent")}
        >
          최근 본
        </button>
        <button
          className={`tab ${activeTab === "comment" ? "active" : ""}`}
          onClick={() => setActiveTab("comment")}
        >
          내 댓글
        </button>
      </div>

      {/* 탭별 콘텐츠 */}
      {activeTab === "subscribe" && <MySubscribeSection />}
      {activeTab === "bookmark" && <MyBookmarkSection />}
      {activeTab === "recent" && <MyRecentSection />}
      {activeTab === "comment" && <MyCommentSection />}
    </div>
  );
}
