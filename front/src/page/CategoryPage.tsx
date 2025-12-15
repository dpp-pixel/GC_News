import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Article {
  articleId: number;
  title: string;
  content: string | null;
  press: string;
  urlString: string;
  publishedAt: string;
  mediaList?: { url: string; mediaType: string }[];
}

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>(); // name에 themeId가 들어옴
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get(`http://localhost:8081/api/articles/category/${name}`);
        setArticles(res.data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryNews();
  }, [name]);

  if (loading) return <p>뉴스를 불러오는 중...</p>;
  if (error) return <p>오류가 발생했습니다.</p>;
  if (!articles.length) return <p>뉴스가 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>카테고리 뉴스</h1>
      {articles.map((a) => (
        <div key={a.articleId} style={{ marginBottom: "20px" }}>
          <a href={a.urlString} target="_blank" rel="noreferrer">
            <h2>{a.title}</h2>
          </a>
          {a.content && <p>{a.content}</p>}
          <span>{a.press} · {new Date(a.publishedAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
