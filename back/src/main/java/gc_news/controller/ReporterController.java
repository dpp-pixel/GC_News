package gc_news.controller;

import gc_news.repository.ReporterRepository;
import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.service.ReporterArticleCrawlingService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reporters")
@RequiredArgsConstructor
public class ReporterController {

    private final ReporterRepository reporterRepository;
    private final ReporterArticleCrawlingService reporterArticleCrawlingService;

    @GetMapping("/{reporterId}")
    public Map<String, Object> getReporterPage(@PathVariable Long reporterId) {
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자 없음"));

        // 기자 정보는 DB 값 사용 (이미 기사 상세에서 갱신됨)
        // 필요시 프로필 새로고침:
        // Reporter updated = reporterArticleCrawlingService.crawlReporterProfile(reporter);
        // reporter = reporterRepository.save(updated);

        // 그 기자가 쓴 기사 목록만 크롤링 (DB 저장 X)
        List<Article> articles = reporterArticleCrawlingService.crawlReporterArticles(reporter);

        return Map.of(
                "reporter", reporter,
                "articles", articles
        );
    }
}