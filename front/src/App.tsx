import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
//import Sidebar from "./components/Sidebar/Sidebar";

import MainContent from "./page/MainContent";
import CategoryPage from "./page/CategoryPage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <CategoryBar />

<main>
  {/* 메인 콘텐츠 영역 */}
  <div>
    <Routes>
      <Route
        path="/"
        element={
          <>
            <MainContent />
          </>
        }
      />
      <Route path="/category/:name" element={<CategoryPage />} />
    </Routes>
  </div>

  {/* 사이드바 자리 */}
  {/* <Sidebar className="w-80" /> */}
</main>

    </BrowserRouter>
  );
}

export default App;
