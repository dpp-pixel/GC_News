import NaverNews from "../components/mainpage/NaverNews";
import YoutubeLatestNews from "../components/mainpage/YoutubeLatestNews";

export default function MainPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>최신 뉴스</h2>

      {/* 최신 뉴스 가져오기 */}
      <NaverNews/>

      {/* 유튜브 최신 뉴스 */}
      <YoutubeLatestNews/>
    </div>
  );
}
