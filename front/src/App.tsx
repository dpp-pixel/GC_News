import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
// import Sidebar from "./components/Sidebar/Sidebar";

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";
import ArticleDetailPage from "./page/ArticleDetailPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <CategoryBar />

      <main className="app-main">
        {/* 메인 콘텐츠 */}
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/category/:themeId" element={<CategoryPage />} />
            <Route path="/article/:articleId" element={<ArticleDetailPage />} />
          </Routes>
        </div>

        {/* 사이드바 자리 */}
        {/* <Sidebar className="sidebar" /> */}
      </main>
    </BrowserRouter>
  );
}

export default App;
