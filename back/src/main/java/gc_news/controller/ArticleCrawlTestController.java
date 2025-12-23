package gc_news.controller;

import java.io.IOException;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.service.ArticleService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class ArticleCrawlTestController {

    private final ArticleService articleService;

    /**
     * 예시 호출:
     * GET /api/test/attach-reporter?url=네이버기사URL&press=KBS
     */
    @GetMapping("/attach-reporter")
    public Map<String, Object> testAttachReporter(
            @RequestParam String url,
            @RequestParam String press
    ) throws IOException {

        // 1. 기사 HTML 가져오기
        Document document = Jsoup.connect(url)
                .userAgent("Mozilla/5.0")
                .get();

        // 2. 테스트용 Article 객체 (DB에 안 넣어도 됨)
        Article article = Article.builder()
                .title(document.title())
                .press(press)
                .build();

        // 3. 기사 HTML에서 기자 찾아서 article에 붙이기
        articleService.attachReporterFromArticlePage(document, article);

        Reporter reporter = article.getReporter();

        // 4. 결과를 JSON으로 반환
        return Map.of(
                "articleTitle", article.getTitle(),
                "press", article.getPress(),
                "reporterName", reporter != null ? reporter.getName() : null,
                "externalJournalistId", reporter != null ? reporter.getExternalJournalistId() : null
        );
    }
}
