package gc_news.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class YoutubeService {

    private final String API_KEY = "AIzaSyAl2vNPZa13-OJPnCLG3d-BLM1m_cJ22ds";

    public Object getLatestVideos(String channelId) {

        String url = "https://www.googleapis.com/youtube/v3/search?"
                + "part=snippet"
                + "&channelId=" + channelId
                + "&order=date"
                + "&type=video"
                + "&maxResults=1" // 지금은 토큰을 많이 먹음 1개만
                + "&safeSearch=none"
                + "&key=" + API_KEY;

        try {
            RestTemplate rest = new RestTemplate();
            return rest.getForObject(url, Object.class);

        } catch (Exception e) {
            log.error(" YouTube API ERROR! channelId = {}", channelId, e); // 빨간 로그 출력됨
            throw e;
        }
    }
}
