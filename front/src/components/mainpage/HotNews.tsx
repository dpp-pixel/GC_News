import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./HotNews.css";

interface Article {
  articleId: number;
  title: string;
  urlString: string;
  press: string;
  viewCount: number;
  mediaList?: { url: string }[];
  theme?: {
    themeId: number;
    name: string;
  } | null;
}

interface CategoryHotNews {
  themeId: number;
  themeName: string;
  articles: Article[];
}

export default function HotNews() {
  const [hotNews, setHotNews] = useState<CategoryHotNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotNews = async () => {
      try {
        const res = await axios.get<Record<number, Article[]>>(
          "http://localhost:8081/api/articles/hot/grouped",
          {
            params: {
              days: 3,
              limit: 3,
            },
          }
        );

        const result = Object.entries(res.data).map(
          ([themeId, articles]) => ({
            themeId: Number(themeId),
            themeName: articles[0]?.theme?.name ?? "",
            articles,
          })
        );

        setHotNews(result);
      } finally {
        setLoading(false);
      }
    };

    fetchHotNews();
  }, []);

  if (loading) return <p>인기 뉴스 불러오는 중...</p>;

  return (
    <section className="hot-news">
      <h2>인기 뉴스</h2>

      <div className="hot-grid">
        {hotNews.map((category) => (
          <div key={category.themeId} className="hot-card">
            <h3>{category.themeName}</h3>

            <ul>
              {category.articles.map((article, idx) => (
                <li key={article.articleId} className="hot-item">
                  {/* 첫 기사만 이미지 */}
                  {idx === 0 && article.mediaList?.[0]?.url && (
                    <div className="hot-image">
                      <img
                        src={article.mediaList[0].url}
                        alt={article.title}
                      />
                    </div>
                  )}

                  {/* ❗️여기가 핵심 수정 부분 */}
                  <Link
                    to={`/news/${article.articleId}`}
                    className={idx === 0 ? "hot-title main" : "hot-title"}
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
