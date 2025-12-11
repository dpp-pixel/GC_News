package gc_news.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import gc_news.service.NewsCrawlingService;

@RestController
@RequiredArgsConstructor
public class NewsController {

    private final NewsCrawlingService newsCrawlingService;

    @GetMapping("/news/crawl")
    public String crawl() {
        newsCrawlingService.crawlSection();
        return "크롤 완료 — 콘솔에서 확인하세요!";
    }
}