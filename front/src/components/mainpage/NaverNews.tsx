import { useEffect, useState } from "react";
import axios from "axios";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
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
        const res = await axios.get("http://localhost:8081/api/news", {
          params: { query: "긴급" },
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
  }, []);

  if (loading) return <p>뉴스를 불러오는 중...</p>;
  if (error) return <p>뉴스를 불러오는 중 오류가 발생했습니다.</p>;
  if (news.length === 0) return <p>뉴스가 없습니다.</p>;

  return (
    <div className="grid grid-cols-12 gap-6" style={{ paddingLeft: "227px", paddingRight: "227px" }}>
  {/* 좌측 메인 영역 */}
  <div className="col-span-9 space-y-4">
    {/* 1번 기사 큰 카드 */}
    {news[0] && (
      <div className="grid grid-cols-2 gap-4 p-6 border rounded h-80">
        <div className="bg-gray-200 flex items-center justify-center">1번 기사 사진</div>
        <div className="bg-cyan-100 p-4 flex flex-col justify-center">
          <a href={news[0].link} target="_blank" rel="noreferrer" className="text-2xl font-bold hover:underline">
            {news[0].title}
          </a>
          <p className="text-gray-600 mt-2">{news[0].description}</p>
        </div>
      </div>
    )}

    {/* 2~3번 기사 큰 카드 */}
    <div className="grid grid-cols-2 gap-4">
      {news.slice(1, 3).map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-2 p-4 border rounded h-60">
          <div className="bg-gray-200 flex items-center justify-center">{`${idx+2}번 기사 사진`}</div>
          <div className="bg-cyan-100 p-2 flex flex-col justify-center">
            <a href={item.link} target="_blank" rel="noreferrer" className="text-lg font-bold hover:underline">
              {item.title}
            </a>
            <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* 우측 사이드 영역 */}
  <div className="col-span-3 space-y-4">
    {news.slice(3, 5).map((item, idx) => (
      <div key={idx} className="grid grid-cols-1 gap-2 p-2 border rounded h-40">
        <div className="bg-yellow-100 p-1 text-center font-semibold">{`${idx + 4}번 기사 제목`}</div>
        <div className="bg-gray-200 flex items-center justify-center">{`${idx + 4}번 기사 사진`}</div>
      </div>
    ))}
  </div>
</div>

  );
}
