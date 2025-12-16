import { useEffect, useState } from "react";
import axios from "axios";
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
        const res = await axios.get<Article[]>(
          "http://localhost:8081/api/articles"
        );

        const map = new Map<number, CategoryHotNews>();

        res.data.forEach((article) => {
          if (!article.theme) return;

          const themeId = article.theme.themeId;

          if (!map.has(themeId)) {
            map.set(themeId, {
              themeId,
              themeName: article.theme.name,
              articles: [],
            });
          }

          map.get(themeId)!.articles.push(article);
        });

        const result = Array.from(map.values()).map((cat) => ({
          ...cat,
          articles: cat.articles
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 3),//기사 갯수
        }));

        setHotNews(result);
      } catch (e) {
        console.error("HotNews fetch error", e);
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

                  <a
                    href={article.urlString}
                    target="_blank"
                    rel="noreferrer"
                    className={idx === 0 ? "hot-title main" : "hot-title"}
                  >
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
