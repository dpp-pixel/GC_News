import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";
import SearchPage from "./page/SearchPage";
import NewsDetailPage from "./page/NewsDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <CategoryBar />

      {/* ❗️여기가 핵심: 페이지가 렌더링될 자리 */}
      <main style={{ paddingTop: "120px" }}>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
