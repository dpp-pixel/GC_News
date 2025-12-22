import NaverNews from "../components/mainpage/NaverNews";
import LatestNewsList from "../components/mainpage/LatestNewsList";
import YoutubeLatestNews from "../components/mainpage/YoutubeLatestNews";
import HotNews from "../components/mainpage/HotNews"
//import Sidebar from "../Sidebar/Sidebar";

export default function MainContent() {
  return (
    <div >
      {/* 메인 영역 */}
      <div >
        {/* 큰 메인 뉴스 */}
        <NaverNews />
        {/* 최신 뉴스 */}
        <LatestNewsList /> 

        {/* 하단 유튜브 영상 */}
         <YoutubeLatestNews /> 

        {/* 테마 별 조회수 높은순 */}
        <HotNews/>
      </div>

      {/* 사이드바 자리 */}
      {/* <Sidebar className="w-80" /> */}
    </div>
  );
}
