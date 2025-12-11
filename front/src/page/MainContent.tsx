import NaverNews from "../components/mainpage/NaverNews";
import YoutubeLatestNews from "../components/mainpage/YoutubeLatestNews";
//import Sidebar from "../Sidebar/Sidebar";

export default function MainContent() {
  return (
    <div className="flex max-w-6xl mx-auto mt-6 px-4 gap-6">
      {/* 메인 영역 */}
      <div className="flex-1 space-y-6">
        {/* 큰 메인 뉴스 */}
        <NaverNews />

        {/* 하단 유튜브 영상 */}
        <YoutubeLatestNews />
      </div>

      {/* 사이드바 자리 */}
      {/* <Sidebar className="w-80" /> */}
    </div>
  );
}
