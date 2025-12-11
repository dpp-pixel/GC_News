import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<"date" | "sim">("date");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get("http://localhost:8081/api/news", {
          params: { query: name || "", display: 10, sort }
        });
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
  }, [name, sort]);

  return (
    <div>
      <h2>{name || "전체"} 뉴스</h2>

       <div style={{ marginBottom: "1rem" }}>     {/* 정렬(최신,정확도) 지우려면 여기 제거 */}
        <label>
          정렬:
          <select value={sort} onChange={(e) => setSort(e.target.value as "date" | "sim")} style={{ marginLeft: "0.5rem" }}>
            <option value="date">최신순</option>
            <option value="sim">정확도순</option>
          </select>
        </label>
      </div>

      {loading && <p>뉴스를 불러오는 중...</p>}
      {error && <p>뉴스를 불러오는 중 오류가 발생했습니다.</p>}
      {!loading && !error && news.length === 0 && <p>뉴스가 없습니다.</p>}

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
