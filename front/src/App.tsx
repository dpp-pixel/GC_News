// App.tsx
import Header from "./components/layout/Header";
import CategoryBar from "./components/layout/categorybar/CategoryBar";
import YoutubeLatestNews from "./components/YoutubeLatestNews";
function App() {
  return (
    <>
      <Header />
      <CategoryBar />

      <main>
        {/* 페이지 내용 */}
        <YoutubeLatestNews />
      </main>
    </>
  );
}

export default App;



