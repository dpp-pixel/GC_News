import { useEffect, useState } from "react";
import axios from "axios";
import "./NaverNews.css";

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
        const res = await axios.get(
  "http://localhost:8081/api/articles/hot",
  {
    params: {
      days: 3,
      limit: 6, // 메인 + 서브 + 리스트용
    },
  }
);
        setNews(res.data);
      } catch (e) {
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
    <section className="news-container">
      <div className="main-layout">

        {/* 왼쪽 영역: 메인 + 서브 기사 */}
        <div className="left-news">
          {news[0] && <MainArticle item={news[0]} />}
          <div className="sub-grid">
            {news.slice(1, 3).map((item) => (
              <SubArticle key={item.articleId} item={item} />
            ))}
          </div>
        </div>

        {/* 오른쪽 리스트 기사 */}
        <div className="right-list">
          {news.slice(4).map((item) => (
            <ListArticle key={item.articleId} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ================== 컴포넌트 ================== */

function MainArticle({ item }: { item: Article }) {
  return (
    <article className="main-article horizontal">
      {item.mediaList?.[0]?.url && (
        <div className="main-image">
          <img src={item.mediaList[0].url} alt={item.title} />
        </div>
      )}

      <div className="main-text">
        <a href={item.urlString} target="_blank" rel="noreferrer">
          <h1>{item.title}</h1>
        </a>
        {item.content && <p className="summary">{item.content}</p>}
        <p className="meta">
          {item.press} · {new Date(item.publishedAt).toLocaleString()}
        </p>
      </div>
    </article>
  );
}

function SubArticle({ item }: { item: Article }) {
  return (
    <article className="sub-article vertical">
      {item.mediaList?.[0]?.url && (
        <div className="sub-image">
          <img src={item.mediaList[0].url} alt={item.title} />
        </div>
      )}
      <div className="sub-text">
        <a href={item.urlString} target="_blank" rel="noreferrer">
          <h3>{item.title}</h3>
        </a>
        {item.content && <p className="summary">{item.content}</p>}
        <p className="meta">{item.press}</p>
      </div>
    </article>
  );
}

function ListArticle({ item }: { item: Article }) {
  return (
    <article className="list-article">
      <a href={item.urlString} target="_blank" rel="noreferrer">

        {item.mediaList?.[0]?.url && (
          <div className="list-thumb">
            <img src={item.mediaList[0].url} alt={item.title} />
          </div>
        )}

        <h4>{item.title}</h4>
        <span>{item.press}</span>

      </a>
    </article>
  );
}
