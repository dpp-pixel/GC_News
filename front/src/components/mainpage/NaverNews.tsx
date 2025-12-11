import { useEffect, useState } from "react";
import axios from "axios";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export default function NaverNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get("http://localhost:8081/api/news", { params: { query: "긴급" } });// 키워드 넣어야함
        setNews(res.data.items || []);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setError(true);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p>뉴스를 불러오는 중...</p>;
  if (error) return <p>뉴스를 불러오는 중 오류가 발생했습니다.</p>;
  if (news.length === 0) return <p>뉴스가 없습니다.</p>;

  return (
    <div>
      <h2>전체 뉴스</h2>
      {news.map((item, idx) => (
        <div key={idx} style={{ marginBottom: "1rem" }}>
          <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
          <p>{item.description}</p>
          <small>{item.pubDate}</small>
        </div>
      ))}
    </div>
  );
}
