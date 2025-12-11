import { useState, useEffect } from "react";
import axios from "axios";

const channels = [
  { name: "KBS News", channelId: "UCcQTRi69dsVYHN3exePtZ1A" },
  { name: "MBC News", channelId: "UCF4Wxdo3inmxP-Y59wXDsFw" },
  { name: "SBS News", channelId: "UCkinYTS9IHqOEwR1Sze2JTw" },
  { name: "YTN", channelId: "UChlgI3UHCOnwUGzWzbJ3H5w" }
];

const API_KEY = "AIzaSyAl2vNPZa13-OJPnCLG3d-BLM1m_cJ22ds";

// 카드 컴포넌트 — 작은 카드 + 4개씩 그리드
function YoutubeCard({ title, videoId }: { title: string; videoId: string }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "8px",
        width: "100%",
        background: "#fafafa"
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
  const [videos, setVideos] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchVideos = async () => {
      const results = await Promise.all(
        channels.map(async (ch) => {
          try {
            const ch = channels[0]; // KBS News 하나만 선택, 나중에 제거
            const res = await axios.get(
              "https://www.googleapis.com/youtube/v3/search",
              {
                params: {
                  part: "snippet",
                  channelId: ch.channelId,
                  order: "date",
                  maxResults: 1, // n개 가져오기
                  key: API_KEY
                }
              }
            );

            const mapped = res.data.items
              .filter((item: any) => item.id.kind === "youtube#video")
              .slice(0, 1) // 가져오는 갯수
              .map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title
              }));

            return { name: ch.name, videos: mapped };
          } catch (err) {
            console.error(`FAIL: ${ch.name}`, err);
            return { name: ch.name, videos: [] };
          }
        })
      );

      const newData: Record<string, any[]> = {};
      results.forEach((r) => (newData[r.name] = r.videos));
      setVideos(newData);
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>유튜브 최신 뉴스</h2>

      {channels.map((ch) => (
        <div key={ch.name} style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "12px" }}>{ch.name}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // 1줄에 4개씩
              gap: "12px",
    marginBottom: "32px"
            }}
          >
            {videos[ch.name] ? (
              videos[ch.name].map((v) => (
                <YoutubeCard
                  key={v.videoId}
                  title={v.title}
                  videoId={v.videoId}
                />
              ))
            ) : (
              <p>불러오는 중...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default YoutubeLatestNews;
