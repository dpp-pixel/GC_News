package gc_news.controller;

//크롤링을 이쪽에서
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import gc_news.entity.Article;
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

     //헤드라인만 크롤링
    @GetMapping("/news/crawl/headline")
    public String crawlHeadlines() {
        newsCrawlingService.crawlHeadlineSections();
        return "헤드라인 크롤 완료 — 콘솔에서 확인하세요!";
    }
}