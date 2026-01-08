import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loading } from "@/components";
import "./HotNews.css";

interface Article {
  articleId: number;
  title: string;
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

  if (loading) return <Loading text="인기 뉴스 불러오는 중" />;

  return (
    <section className="hot-news">
      <h2>인기 뉴스</h2>

      <div className="hot-grid">
        {hotNews.map((category) => (
          <div key={category.themeId} className="hot-card">
            <h3>{category.themeName}</h3>

            {/* 첫 번째 기사: 이미지 표시 */}
            {category.articles[0] && (
              <div className="hot-main-article">
                <div className="hot-image">
                  {category.articles[0].mediaList?.[0]?.url ? (
                    <img
                      src={category.articles[0].mediaList[0].url}
                      alt={category.articles[0].title}
                    />
                  ) : (
                    <div className="hot-image-placeholder">
                      <span>📰</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/news/${category.articles[0].articleId}`}
                  className="hot-title main"
                >
                  {category.articles[0].title}
                </Link>
              </div>
            )}

            {/* 나머지 기사들: 텍스트만 */}
            <ul>
              {category.articles.slice(1).map((article) => (
                <li key={article.articleId} className="hot-item">
                  <Link
                    to={`/news/${article.articleId}`}
                    className="hot-title"
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
