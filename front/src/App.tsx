import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";

import NaverNews from "./components/mainpage/NaverNews";
import YoutubeLatestNews from "./components/mainpage/YoutubeLatestNews";
import CategoryPage from "./page/CategoryPage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <CategoryBar />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NaverNews />
                <YoutubeLatestNews />
              </>
            }
          />
          <Route path="/category/:name" element={<CategoryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
