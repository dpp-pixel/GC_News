import { useEffect, useState } from "react";
import axios from "axios";

/* 임시 유저 키 */
const getUserKey = () => {
  let key = localStorage.getItem("userKey");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("userKey", key);
  }
  return key;
};

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

  const fetchCounts = async () => {
    const res = await axios.get(
      `http://localhost:8081/api/articles/${articleId}/reactions`
    );
    setCounts(res.data);
  };

  useEffect(() => {
    fetchCounts();
  }, [articleId]);

  const react = async (type: "happy" | "sad" | "angry") => {
    const userKey = getUserKey();

    await axios.post(
      "http://localhost:8081/api/articles/reactions",
      null,
      {
        params: { articleId, userKey, type },
      }
    );

    fetchCounts();
  };

  return (
    <div className="article-reactions">
      <button onClick={() => react("happy")}>
        😊 행복해요 {counts.happy ?? 0}
      </button>
      <button onClick={() => react("sad")}>
        😢 슬퍼요 {counts.sad ?? 0}
      </button>
      <button onClick={() => react("angry")}>
        😡 화나요 {counts.angry ?? 0}
      </button>
    </div>
  );
}
