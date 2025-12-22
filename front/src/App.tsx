// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
import Footer from "./components/layout/footer/Footer";   // ✅ 추가

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";
import NewsDetailPage from "./page/NewsDetailPage";
import MyContentsPage from "./page/mycontent/MyContentsPage";
import ProfilePage from "./page/ProfilePage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

// ✅ 실제 레이아웃을 담당하는 컴포넌트
function AppShell() {
  const location = useLocation();

  // ✅ 이 경로들에서는 카테고리바 숨기기
  const hideCategoryBar =
    location.pathname.startsWith("/my-contents") ||
    location.pathname.startsWith("/profile");

  return (
    <>
      <Header />

      {/* ✅ 내 콘텐츠/회원정보 페이지가 아니면 카테고리바 보여줌 */}
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
          </Routes>
        </div>
      </main>

      {/* ✅ 모든 페이지 공통 푸터 */}
      <Footer />
    </>
  );
}

export default App;
