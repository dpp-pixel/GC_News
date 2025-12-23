package gc_news.controller;

import gc_news.repository.ReporterRepository;
import gc_news.entity.Reporter;
import gc_news.service.ReporterArticleCrawlingService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reporters")
@RequiredArgsConstructor
public class ReporterController {

    private final ReporterRepository reporterRepository;
  private final ReporterArticleCrawlingService reporterArticleCrawlingService;
  @GetMapping("/{reporterId}")
public Map<String, Object> getReporterPage(
    @PathVariable Long reporterId
) {
    Reporter reporter = reporterRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("기자 없음"));

    return Map.of(
        "reporter", reporter,
        "articles", reporterArticleCrawlingService
                .crawlReporterArticles(reporter)
    );
}
}