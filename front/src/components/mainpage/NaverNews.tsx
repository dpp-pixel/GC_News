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
      .get("http://localhost:8080/api/news", {
        params: { query: "속보" },
      })
      .then((res) => {
        const items = JSON.parse(res.data).items;
        setNews(items);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>속보 뉴스</h2>

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
