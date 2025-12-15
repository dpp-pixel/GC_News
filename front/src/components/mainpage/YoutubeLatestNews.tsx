import { useState, useEffect } from "react";
import axios from "axios";
import "./YoutubeLatestNews.css";

const channels = [
  { name: "KBS News", channelId: "UCcQTRi69dsVYHN3exePtZ1A" },
  { name: "MBC News", channelId: "UCF4Wxdo3inmxP-Y59wXDsFw" }, 
  { name: "SBS News", channelId: "UCkinYTS9IHqOEwR1Sze2JTw" },
  { name: "YTN", channelId: "UChlgI3UHCOnwUGzWzbJ3H5w" }
];

// 카드 컴포넌트
function YoutubeCard({ title, videoId }: { title: string; videoId: string }) {
  return (
    <div
  style={{
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "8px",
    width: "250px", // 고정 폭
    background: "#fafafa",
    flex: "0 0 auto" // flexbox에서 카드가 줄어들지 않게
  }}
>
      <div style={{ position: "relative", paddingBottom: "56%", height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "6px"
          }}
          allowFullScreen
          title={title}
        />
      </div>

      <p style={{ fontSize: "13px", marginTop: "6px" }}>{title}</p>
    </div>
  );
}

function YoutubeLatestNews() {
  const [videos, setVideos] = useState<{ videoId: string; title: string }[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const results = await Promise.all(
          channels.map(async (ch) => {
            const res = await axios.get(
              "http://localhost:8081/api/youtube/latest",
              { params: { channelId: ch.channelId } }
            );

            const items = res.data.items;

            return items
              .filter((item: any) => item.id.kind === "youtube#video")
              .slice(0, 3) // 갯수 조절
              .map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title
              }));
          })
        );

        // 배열을 평탄화 (모든 채널 영상 하나의 배열로 합침)
        const allVideos = results.flat();
        setVideos(allVideos);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>유튜브 최신 뉴스</h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "12px"
        }}
      >
        {videos.length > 0 ? (
          videos.map((v) => <YoutubeCard key={v.videoId} title={v.title} videoId={v.videoId} />)
        ) : (
          <p>불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
export default YoutubeLatestNews;
