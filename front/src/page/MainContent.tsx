// src/page/MainContent.tsx
import NaverNews from "../components/mainpage/NaverNews";
import LatestNewsList from "../components/mainpage/LatestNewsList";
import YoutubeLatestNews from "../components/mainpage/YoutubeLatestNews";
import HotNews from "../components/mainpage/HotNews";
// import Sidebar from "../Sidebar/Sidebar";

// ✅ 관리자 페이지에서 쓰는 카드 공용 컴포넌트
import AdminSummaryCard from "../page/admin/AdminSummaryCard";

export default function MainContent() {
  return (
    <div>
      {/* 메인 영역 */}
      <div>
        {/* 1. 큰 메인 뉴스 */}
        <NaverNews />

        {/* 2. 🔽 메인 뉴스 AI 요약 카드 (한 장) */}
        <section
          style={{
            width: 1100,
            margin: "32px auto 24px",
          }}
        >
          <AdminSummaryCard badge="메인 뉴스" badgeTone="main" />
        </section>

        {/* 3. 최신 뉴스 리스트 */}
        <LatestNewsList />

        {/* 4. 하단 유튜브 영상 */}
        {/* <YoutubeLatestNews /> */}

        {/* 5. 테마 별 조회수 높은순 */}
        <HotNews />
      </div>

      {/* 사이드바 자리 */}
      {/* <Sidebar className="w-80" /> */}
    </div>
  );
}
