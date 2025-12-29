import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./NaverNews.css";

interface Article {
  articleId: number;
  title: string;
  content: string | null;
  press: string;
  urlString: string;
  publishedAt: string;
  clusterCount: number;
  mediaList?: { url: string; mediaType: string }[];
}

// ✅ HTML 태그 제거 + 길이 제한용 유틸 함수
function stripHtml(html: string | null, maxLength = 120): string {
  if (!html) return "";

  // 태그 제거
  let text = html.replace(/<[^>]+>/g, " ");
  // 공백 정리
  text = text.replace(/\s+/g, " ").trim();

  // 너무 길면 뒤를 자르고 "..." 붙이기
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "…";
  }
  return text;
}

export default function NaverNews() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get<Article[]>(
  "http://localhost:8081/api/articles/headline",
  {
    params: {
      limit: 6,
    },
  }
);
        setNews(res.data);
      } catch (e) {
        console.error("NaverNews /api/articles/headline error:", e);
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

/* ================== 하위 컴포넌트 ================== */

function MainArticle({ item }: { item: Article }) {
  const summary = stripHtml(item.content, 160); // 메인 카드라 조금 더 길게

  return (
    <article className="main-article horizontal">
      {item.mediaList?.[0]?.url && (
        <div className="main-image">
          <img src={item.mediaList[0].url} alt={item.title} />
        </div>
      )}

      <div className="main-text">
        {/* 제목 클릭 → 기사 상세 */}
        <Link to={`/news/${item.articleId}`} className="title-link">
          <h1>{item.title}</h1>
        </Link>

        {summary && <p className="summary">{summary}</p>}

        <p className="meta">
          {item.press} · {new Date(item.publishedAt).toLocaleString()}
        </p>
          <div className="cluster-count">
          관련뉴스 {item.clusterCount}개
        </div>
      </div>
    </article>
  );
}

function SubArticle({ item }: { item: Article }) {
  const summary = stripHtml(item.content, 80);

  return (
    <article className="sub-article vertical">
      {item.mediaList?.[0]?.url && (
        <div className="sub-image">
          <img src={item.mediaList[0].url} alt={item.title} />
        </div>
      )}

      <div className="sub-text">
        {/* 제목 클릭 → 기사 상세 */}
        <Link to={`/news/${item.articleId}`} className="title-link">
          <h3>{item.title}</h3>
        </Link>

        {summary && <p className="summary">{summary}</p>}
        <p className="meta">{item.press}</p>
      </div>
      <div className="cluster-count">
          관련뉴스 {item.clusterCount}개
        </div>
    </article>
    
  );
}

function ListArticle({ item }: { item: Article }) {
  return (
    <article className="list-article">
      {/* 리스트 전체 클릭 → 기사 상세 */}
      <Link to={`/news/${item.articleId}`} className="list-link">
        {item.mediaList?.[0]?.url && (
          <div className="list-thumb">
            <img src={item.mediaList[0].url} alt={item.title} />
          </div>
        )}

        <h4>{item.title}</h4>
        <span>{item.press}</span>
      </Link>
      <div className="cluster-count">
          관련뉴스 {item.clusterCount}개
        </div>
    </article>
  );
}