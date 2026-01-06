package gc_news.controller;

import gc_news.dto.ArticleDetailResponse;
import gc_news.entity.Article;
import gc_news.entity.User;
import gc_news.service.ArticleService;
import gc_news.service.UserViewHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import gc_news.entity.Summary;
import gc_news.service.AiService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final UserViewHistoryService userViewHistoryService;
    private final AiService aiService;

    @GetMapping("/{articleId}")
    public ArticleDetailResponse getArticleDetail(
            @PathVariable Long articleId,
            @AuthenticationPrincipal User user) {

        Article article = articleService.loadArticleContentIfNeeded(articleId);

        if (user != null) {
            userViewHistoryService.saveViewHistory(user, article);
        }

        return ArticleDetailResponse.from(article);
    }

    // 전체 / 테마별 인기 뉴스 (조회수 순, 최근 days일 기준)
    // 예: /api/articles/hot?days=3&limit=10&themeId=1
    @GetMapping("/hot")
    public List<Article> hotArticles(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long themeId) {
        return articleService.getHotArticles(days, limit, themeId);
    }

    // 카테고리별 인기 뉴스 그룹
    // 예: /api/articles/hot/grouped?days=3&limit=3
    @GetMapping("/hot/grouped")
    public Map<Long, List<Article>> hotArticlesGrouped(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "3") int limit) {
        return articleService.getHotArticlesGroupedByTheme(days, limit);
    }

    // 최신 기사 조회 (limit 개수)
    @GetMapping("/latest")
    public List<Article> getLatestArticles(
            @RequestParam(defaultValue = "16") int limit) {
        return articleService.getLatestArticles(limit);
    }

    // 칼럼 조회 (Theme 200)
    @GetMapping("/columns")
    public List<Article> getLatestColumns(
            @RequestParam(defaultValue = "10") int limit) {
        return articleService.getLatestColumns(limit);
    }

    // 카테고리별 최신 기사 조회 (페이지 처리)
    // 예: /api/articles/category/{themeId}?page=0&size=10
    @GetMapping("/category/{themeId}")
    public Page<Article> getArticlesByTheme(
            @PathVariable Long themeId,
            Pageable pageable) {
        return articleService.getArticlesByTheme(themeId, pageable);
    }

    @GetMapping("/headline")
    public List<Article> headlineArticles(
            @RequestParam(required = false) Long themeId,
            @RequestParam(defaultValue = "5") int limit) {

        if (themeId == null) {
            return articleService.getHeadlineArticles(limit);
        }

        return articleService.getHeadlineArticlesByTheme(themeId, limit);
    }


    @GetMapping("/search")
    public Page<Article> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // 서비스 레이어에서 Repository 호출
        return articleService.searchArticles(keyword, PageRequest.of(page, size));
    }

    // 헤드라인 뉴스 전체 요약
    // 예: /api/articles/headline-summary?force=false
    @GetMapping("/headline-summary")
    public ResponseEntity<?> getHeadlineSummary(
            @RequestParam(defaultValue = "false") boolean force) {
        try {
            // 헤드라인 뉴스 가져오기
            List<Article> headlines = articleService.getHeadlineArticles(6);

            if (headlines.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("헤드라인 뉴스가 없습니다.");
            }

            // AI 요약 생성/조회
            Summary summary = aiService.summarizeHeadlineNews(headlines, force);

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("요약 생성 중 오류 발생: " + e.getMessage());
        }
    }

    // 테마별 헤드라인 뉴스 요약
    // 예: /api/articles/theme-headline-summary?themeId=1&force=false
    @GetMapping("/theme-headline-summary")
    public ResponseEntity<?> getThemeHeadlineSummary(
            @RequestParam Long themeId,
            @RequestParam(defaultValue = "false") boolean force) {
        try {
            // 테마별 헤드라인 뉴스 가져오기
            List<Article> headlines = articleService.getHeadlineArticlesByTheme(themeId, 6);

            if (headlines.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("테마 헤드라인 뉴스가 없습니다.");
            }

            // AI 요약 생성/조회
            Summary summary = aiService.summarizeThemeHeadlineNews(themeId, headlines, force);

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("요약 생성 중 오류 발생: " + e.getMessage());
        }
    }
}
