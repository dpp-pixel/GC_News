import NaverNews from "../components/mainpage/NaverNews";
import YoutubeLatestNews from "../components/mainpage/YoutubeLatestNews";
//import Sidebar from "../Sidebar/Sidebar";

export default function MainContent() {
  return (
    <div >
      {/* 메인 영역 */}
      <div >
        {/* 큰 메인 뉴스 */}
        <NaverNews />

        {/* 하단 유튜브 영상 */}
        {/* <YoutubeLatestNews /> */}
      </div>

      {/* 사이드바 자리 */}
      {/* <Sidebar className="w-80" /> */}
    </div>
  );
}
