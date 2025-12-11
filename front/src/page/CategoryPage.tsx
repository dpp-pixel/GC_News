import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export default function CategoryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("type") || "정치";

  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/news", {
        params: { query: category }
      })
      .then((res) => {
        setNews(res.data.items); // ⭐ NaverNews와 동일한 구조
      })
      .catch((err) => console.error("API 오류:", err));
  }, [category]);

  return (
    <div>
      <h2>{category} 뉴스</h2>

      {news.length === 0 && <p>뉴스를 불러오는 중...</p>}

      {news.map((item, idx) => (
        <div key={idx}>
          <a href={item.link} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </div>
      ))}
    </div>
  );
}
