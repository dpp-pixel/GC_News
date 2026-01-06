package gc_news.controller;

import gc_news.repository.ReporterRepository;
import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.service.ReporterArticleCrawlingService;
import gc_news.service.ReporterSubscriptionService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reporters")
@RequiredArgsConstructor
public class ReporterController {

    private final ReporterRepository reporterRepository;
    private final ReporterArticleCrawlingService reporterArticleCrawlingService;
    private final ReporterSubscriptionService subscriptionService;

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

    @PostMapping("/{reporterId}/subscribe")
    public ResponseEntity<Map<String, String>> subscribeReporter(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        subscriptionService.subscribeReporter(userId, reporterId);
        return ResponseEntity.ok(Map.of("message", "구독 완료"));
    }

    @PostMapping("/{reporterId}/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribeReporter(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        subscriptionService.unsubscribeReporter(userId, reporterId);
        return ResponseEntity.ok(Map.of("message", "구독 취소 완료"));
    }

    @GetMapping("/{reporterId}/is-subscribed")
    public ResponseEntity<Map<String, Boolean>> isSubscribed(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        boolean subscribed = subscriptionService.isSubscribed(userId, reporterId);
        return ResponseEntity.ok(Map.of("isSubscribed", subscribed));
    }

    @PostMapping("/{reporterId}/recommend")
    public ResponseEntity<Map<String, String>> recommendReporter(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        subscriptionService.recommendReporter(userId, reporterId);
        return ResponseEntity.ok(Map.of("message", "추천 완료"));
    }

    @PostMapping("/{reporterId}/unrecommend")
    public ResponseEntity<Map<String, String>> unrecommendReporter(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        subscriptionService.unrecommendReporter(userId, reporterId);
        return ResponseEntity.ok(Map.of("message", "추천 취소 완료"));
    }

    @GetMapping("/{reporterId}/is-recommended")
    public ResponseEntity<Map<String, Boolean>> isRecommended(
            @PathVariable Long reporterId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        boolean recommended = subscriptionService.isRecommended(userId, reporterId);
        return ResponseEntity.ok(Map.of("isRecommended", recommended));
    }
}