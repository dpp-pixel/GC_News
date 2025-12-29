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

// 실제 레이아웃을 담당하는 컴포넌트
function AppShell() {
  const location = useLocation();

  // ✅ 로그인 / 회원가입 페이지 여부
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  // ✅ 이 경로들에서는 카테고리바 숨기기
  const hideCategoryBar =
    isAuthPage ||
    location.pathname.startsWith("/my-contents") ||
    location.pathname.startsWith("/profile");

  return (
    <>
      {/* ✅ 로그인/회원가입 페이지가 아닐 때만 헤더 노출 */}
      {!isAuthPage && <Header />}

      {/* ✅ 로그인/회원가입 페이지가 아니고, hideCategoryBar가 false일 때만 카테고리바 노출 */}
      {!hideCategoryBar && <CategoryBar />}

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

      {/* 푸터는 그대로 공통 노출 (필요하면 나중에 auth 페이지에서 숨길 수 있음) */}
      <Footer />
    </>
  );
}

export default App;
