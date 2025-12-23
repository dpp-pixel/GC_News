import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/layout/Header/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";
import SearchPage from "./page/SearchPage";
import NewsDetailPage from "./page/NewsDetailPage";
import Login from "./page/Login";
import Signup from "./page/Signup";

function AppLayout() {
  const location = useLocation();
  const hideBars = location.pathname === "/login" || location.pathname === "/signup";


  return (
    <>
      {!hideBars && <Header />}
      {!hideBars && <CategoryBar />}

      <main style={{ paddingTop: hideBars ? "40px" : "120px" }}>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/login" element={<div style={{padding: 20}}>LOGIN INLINE</div>} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
