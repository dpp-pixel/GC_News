package gc_news.controller;

import gc_news.repository.ReporterRepository;
import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.service.NewsCrawlingService;
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

    @PostMapping("/{reporterId}/analyze-trust")
    public ResponseEntity<Map<String, Object>> analyzeTrustScore(@PathVariable Long reporterId) {
        try {
            // 기자 조회
            Reporter reporter = reporterRepository.findById(reporterId)
                    .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

            // 기자의 최근 기사 목록 크롤링
            List<Article> articles = reporterArticleCrawlingService.crawlReporterArticles(reporter);

            if (articles.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "분석할 기사가 없습니다.",
                        "trustScore", reporter.getTrustScore() != null ? reporter.getTrustScore() : 0f
                ));
            }

            // 최대 30개로 제한
            int maxArticles = Math.min(30, articles.size());
            List<Article> articlesToAnalyze = articles.subList(0, maxArticles);

            // 신뢰도 분석 실행
            Float trustScore = reporterArticleCrawlingService.analyzeReporterTrustScore(reporterId, articlesToAnalyze);

            return ResponseEntity.ok(Map.of(
                    "message", "신뢰도 분석이 완료되었습니다.",
                    "trustScore", trustScore,
                    "analyzedCount", maxArticles
            ));

        } catch (Exception e) {
            System.err.println("신뢰도 분석 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "신뢰도 분석 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}