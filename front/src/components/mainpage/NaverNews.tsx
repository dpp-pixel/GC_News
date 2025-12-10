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

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/news", { params: { query: "속보" } })
      .then((res) => {
        const items = res.data.items; // JSON.parse 불필요
        setNews(items);
      })
      .catch((err) => console.error("API 호출 실패:", err));
  }, []);

  return (
    <div>
      <h2>속보 뉴스</h2>
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
