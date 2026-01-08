import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./HotIssueSection.css";

interface Article {
  articleId: number;
  title: string;
  urlString: string;
  press: string;
  viewCount: number;
  clusterCount: number;
  mediaList?: { url: string }[];
}

export default function HotIssueSection({ themeId }: { themeId: number }) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    axios
      .get<Article[]>("http://localhost:8081/api/articles/headline", {
        params: {
          days: 3,
          limit: 20,
          themeId,
        },
      })
      .then((res) => {
        // 같은 URL 또는 같은 clusterCount를 가진 기사 필터링
        const seenUrls = new Set<string>();
        const seenClusterCounts = new Set<number>();
        const uniqueArticles: Article[] = [];

        // 관련뉴스가 많은 순으로 정렬 (clusterCount 내림차순)
        const sortedByCluster = [...res.data].sort((a, b) => b.clusterCount - a.clusterCount);

        for (const article of sortedByCluster) {
          if (uniqueArticles.length >= 5) break;

          if (!seenUrls.has(article.urlString) && !seenClusterCounts.has(article.clusterCount)) {
            seenUrls.add(article.urlString);
            seenClusterCounts.add(article.clusterCount);
            uniqueArticles.push(article);
          }
        }

        // 5개가 안 되면 관련뉴스가 적은 순으로 추가
        if (uniqueArticles.length < 5) {
          const sortedByClusterAsc = [...res.data].sort((a, b) => a.clusterCount - b.clusterCount);

          for (const article of sortedByClusterAsc) {
            if (uniqueArticles.length >= 5) break;

            if (!seenUrls.has(article.urlString)) {
              seenUrls.add(article.urlString);
              uniqueArticles.push(article);
            }
          }
        }

        setArticles(uniqueArticles);
      })
      .catch(console.error);
  }, [themeId]);

  if (articles.length === 0) return null;

  return (
    <section className="hot-issue">
      <h2>헤드라인 뉴스</h2>

      <ul className="hot-list">
        {articles.map((article) => (
          <li key={article.articleId} className="hot-item">
            {/* 썸네일 */}
            <div className="hot-thumbnail">
              {article.mediaList?.[0]?.url ? (
                <img src={article.mediaList[0].url} alt={article.title} />
              ) : (
                <div className="thumbnail-placeholder">
                  <span>📰</span>
                </div>
              )}
            </div>

            {/* 제목과 메타 정보 */}
            <div className="hot-content">
              <Link to={`/news/${article.articleId}`} className="hot-title">
                {article.title}
              </Link>
              <span className="hot-meta">관련뉴스 {article.clusterCount}개</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
