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

export default function NaverNews() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get("http://localhost:8081/news");
        setNews(res.data.slice(0, 5)); // 5개만 표시
      } catch (err) {
        console.error("API 오류:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p>뉴스를 불러오는 중...</p>;
  if (error) return <p>오류가 발생했습니다.</p>;
  if (news.length === 0) return <p>뉴스가 없습니다.</p>;

  return (
    <div className="space-y-6 p-6"> 
      {news.map((item) => (
        <div
          key={item.articleId}
          className="border rounded-lg shadow-sm hover:shadow-md transition p-4 flex gap-4"
        >
          {/* 이미지 */}
          <div className="w-40 h-28 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
            {item.mediaList?.[0]?.url ? (
              <img
                src={item.mediaList[0].url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">이미지 없음</span>
            )}
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col justify-between flex-1">
            <a
              href={item.urlString}
              target="_blank"
              rel="noreferrer"
              className="text-xl font-bold hover:underline"
            >
              {item.title}
            </a>

            {item.content && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {item.content}
              </p>
            )}

            <p className="text-gray-500 text-xs mt-2">
              {item.press} · {new Date(item.publishedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
