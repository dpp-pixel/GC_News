import { useEffect, useState } from "react";
import axios from "axios";

// 채널 타입
interface Channel {
  name: string;
  channelId: string;
}

// 비디오 타입
interface VideoItem {
  videoId: string;
  title: string;
}

// 뉴스 데이터 구조
interface VideoMap {
  [channelName: string]: VideoItem[];
}

// 4개 채널
const channels: Channel[] = [
  { name: "KBS News", channelId: "UCcQTRi69dsVYHN3exePtZ1A" },
  { name: "MBC News", channelId: "UCF4Wxdo3inmxP-Y59wXDsFw" },
  { name: "SBS News", channelId: "UCkinYTS9IHqOEwR1Sze2JTw" },
  { name: "YTN", channelId: "UChlgI3UHCOnwUGzWzbJ3H5w" }
];

// YouTube API Key
const API_KEY = "AIzaSyAl2vNPZa13-OJPnCLG3d-BLM1m_cJ22ds";

// 카드 컴포넌트 타입
interface YoutubeCardProps {
  title: string;
  videoId: string;
}

// 카드 컴포넌트
function YoutubeCard({ title, videoId }: YoutubeCardProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
      <h4>{title}</h4>

      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          allowFullScreen
          title={title}
        />
      </div>
    </div>
  );
}

// 메인 컴포넌트
function YoutubeLatestNews() {
  const [videos, setVideos] = useState<VideoMap>({});

  useEffect(() => {
    const fetchVideos = async () => {
      const results = await Promise.all(
        channels.map(async (ch) => {
          try {
            const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
              params: {
                part: "snippet",
                channelId: ch.channelId,
                maxResults: 2,
                order: "date",
                key: API_KEY,
              },
            });

            const filtered: VideoItem[] = res.data.items
              .filter((item: any) => item.id.kind === "youtube#video")
              .slice(0, 2)
              .map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
              }));

            return { name: ch.name, videos: filtered };
          } catch (err) {
            console.error(`FAIL: ${ch.name}`, err);
            return { name: ch.name, videos: [] };
          }
        })
      );

      const newVideoMap: VideoMap = {};
      results.forEach((r) => {
        newVideoMap[r.name] = r.videos;
      });
      setVideos(newVideoMap);
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h2>유튜브 최신 뉴스</h2>
      {channels.map((ch) => (
        <div key={ch.name} style={{ marginBottom: "32px" }}>
          <h3>{ch.name}</h3>

          {videos[ch.name] ? (
            videos[ch.name].map((v) => (
              <YoutubeCard key={v.videoId} title={v.title} videoId={v.videoId} />
            ))
          ) : (
            <p>불러오는 중...</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default YoutubeLatestNews;
