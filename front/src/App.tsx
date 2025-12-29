// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
import Footer from "./components/layout/footer/Footer";
import ReporterPage from "./components/reporter/repoterpage/ReporterPage";

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";
import NewsDetailPage from "./page/NewsDetailPage";
import MyContentsPage from "./page/mycontent/MyContentsPage";
import ProfilePage from "./page/profilepage/ProfilePage";
import Login from "./page/loginpage/Login";
import Signup from "./page/loginpage/Signup";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

// 실제 레이아웃 담당
function AppShell() {
  const location = useLocation();

  // ✅ 로그인 / 회원가입 페이지 여부
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  // ✅ 기사 상세 페이지 여부 (/news/:id)
  const isNewsDetailPage = location.pathname.startsWith("/news/");

  // ✅ 이 경로들에서는 카테고리바 숨기기
  const hideCategoryBar =
    isAuthPage ||
    location.pathname.startsWith("/my-contents") ||
    location.pathname.startsWith("/profile");

  return (
    <>
      {/* ---------- 상단 영역 (헤더 + 카테고리바) ---------- */}
      {!isAuthPage && (
        isNewsDetailPage ? (
          // ✅ 기사 상세 페이지: 헤더 + 카테고리바 합체 & 고정 + spacer
          <>
            <div className="detail-header-fixed">
              <Header />
              {!hideCategoryBar && <CategoryBar />}
            </div>
            {/* 고정된 영역 높이만큼 본문을 아래로 밀어주는 역할 */}
            <div className="detail-header-spacer" />
          </>
        ) : (
          // ✅ 나머지 페이지: 기존 방식
          <>
            <Header />
            {!hideCategoryBar && <CategoryBar />}
          </>
        )
      )}

      {/* ---------- 메인 콘텐츠 ---------- */}
      <main className="app-main">
        <div className="content-wrapper">
          <Routes>
            {/* 메인 */}
            <Route path="/" element={<MainContent />} />

            {/* 카테고리 페이지 */}
            <Route path="/category/:themeId" element={<CategoryPage />} />

            {/* 기사 상세 페이지 */}
            <Route path="/news/:id" element={<NewsDetailPage />} />

            {/* 내 정보 관련 페이지 */}
            <Route path="/my-contents" element={<MyContentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* 기자 페이지 */}
            <Route path="/reporter/:reporterId" element={<ReporterPage />} />

            {/* 로그인 / 회원가입 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </main>

      {/* ---------- 푸터 ---------- */}
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;
