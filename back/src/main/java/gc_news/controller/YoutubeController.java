package gc_news.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import gc_news.service.YoutubeService;

@RestController
@RequiredArgsConstructor
public class YoutubeController {

    private final YoutubeService youtubeService;

    @GetMapping("/latest")
    public Object getLatest(@RequestParam String channelId) {
        return youtubeService.getLatestVideos(channelId);
    }

}
