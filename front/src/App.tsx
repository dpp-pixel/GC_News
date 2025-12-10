// App.tsx
import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
import YoutubeLatestNews from "./components/mainpage/YoutubeLatestNews";
import NaverNews from "./components/mainpage/NaverNews";
function App() {
  return (
    <>
      <Header />
      <CategoryBar />

      <main>
        {/* 페이지 내용 */}
        <NaverNews />
        <YoutubeLatestNews />
      </main>
    </>
  );
}

export default App;



