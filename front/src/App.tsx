// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

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
import AdminDashboard from "./page/admin/AdminDashboard";

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

  // ✅ 내 구독 페이지 여부 (/my-contents)
  const isMyContentsPage = location.pathname.startsWith("/my-contents");

  // ✅ 카테고리바를 숨길 경로들
  const hideCategoryBar =
    isAuthPage ||
    location.pathname.startsWith("/my-contents") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/admin");

  // ---------- 상단 영역(헤더 + 카테고리바) 구성 ----------
  let topArea: ReactNode | null = null;

  if (!isAuthPage) {
    if (isNewsDetailPage) {
      // 📰 기사 상세: 헤더 + 카테고리바를 fixed 영역으로 묶기
      topArea = (
        <>
          <div className="detail-header-fixed">
            <Header />
            {!hideCategoryBar && <CategoryBar />}
          </div>
          {/* 고정된 영역 높이만큼 본문을 아래로 밀어주는 spacer */}
          <div className="detail-header-spacer" />
        </>
      );
    } else {
      // 그 외 페이지: 기존 방식(헤더 + 카테고리바)
      topArea = (
        <>
          <Header />
          {!hideCategoryBar && <CategoryBar />}
        </>
      );
    }
  }

  return (
    <>
      {/* 상단 공통 영역 */}
      {topArea}

      {/* 메인 콘텐츠 */}
      <main className="app-main">
        {/* 
          기본: content-wrapper
          /my-contents 에서는 content-wrapper--wide 추가
        */}
        <div
          className={
            isMyContentsPage
              ? "content-wrapper content-wrapper--wide"
              : "content-wrapper"
          }
        >
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

            {/* 관리자 페이지 */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>

      {/* 푸터 (로그인/회원가입 페이지에서는 숨김) */}
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;
