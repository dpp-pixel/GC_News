import { useEffect, useState } from "react";
import { api } from "../../api/client"; 
import "./ArticleReaction.css";
import { isLoggedIn } from "../../auth/auth";

interface Props {
  articleId: number;
}

type ReactionCounts = {
  happy?: number;
  sad?: number;
  angry?: number;
};

export default function ArticleReaction({ articleId }: Props) {
  const [counts, setCounts] = useState<ReactionCounts>({});

  // 서버에서 기사 감정 반응 개수 조회
  const fetchCounts = async () => {
    try {
      const res = await api.get(`/articles/${articleId}/reactions`);
      setCounts(res.data);
    } catch (e: any) {
      console.error("감정 반응 조회 실패:", e);
      alert(e.response?.data || "감정 반응 조회 실패");
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [articleId]);

  // 기사 감정 반응 처리
  const react = async (type: "happy" | "sad" | "angry") => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 서버에서는 소문자 Enum을 기대 → type.toLowerCase()로 맞춤
      await api.post("/articles/reactions", null, { params: { articleId, type: type.toLowerCase() } });
      fetchCounts(); // 반응 후 개수 새로 조회
    } catch (e: any) {
      console.error("감정 반응 실패:", e);
      alert(e.response?.data || "감정 반응 실패");
    }
  };

  return (
    <div className="article-reactions">
      <button onClick={() => react("happy")}>😊 행복해요 {counts.happy ?? 0}</button>
      <button onClick={() => react("sad")}>😢 슬퍼요 {counts.sad ?? 0}</button>
      <button onClick={() => react("angry")}>😡 화나요 {counts.angry ?? 0}</button>
    </div>
  );
}
