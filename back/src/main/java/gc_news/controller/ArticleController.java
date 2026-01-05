package gc_news.controller;

import gc_news.dto.ArticleDetailResponse;
import gc_news.entity.Article;
import gc_news.entity.Summary;
import gc_news.entity.User;
import gc_news.service.AiService;
import gc_news.service.ArticleService;
import gc_news.service.UserViewHistoryService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final UserViewHistoryService userViewHistoryService;
    private final AiService aiService;

    // 기사 상세
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

    // 인기 기사
    @GetMapping("/hot")
    public List<Article> hotArticles(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long themeId) {

        return articleService.getHotArticles(days, limit, themeId);
    }

    // 카테고리별 인기 기사 그룹
    @GetMapping("/hot/grouped")
    public Map<Long, List<Article>> hotArticlesGrouped(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "3") int limit) {

        return articleService.getHotArticlesGroupedByTheme(days, limit);
    }

    // 최신 기사
    @GetMapping("/latest")
    public List<Article> getLatestArticles(
            @RequestParam(defaultValue = "16") int limit) {

        return articleService.getLatestArticles(limit);
    }

    // 카테고리별 기사 (페이지)
    @GetMapping("/category/{themeId}")
    public Page<Article> getArticlesByTheme(
            @PathVariable Long themeId,
            Pageable pageable) {

        return articleService.getArticlesByTheme(themeId, pageable);
    }

    // 헤드라인
    @GetMapping("/headline")
    public List<Article> headlineArticles(
            @RequestParam(required = false) Long themeId,
            @RequestParam(defaultValue = "5") int limit) {

        if (themeId == null) {
            return articleService.getHeadlineArticles(limit);
        }

        return articleService.getHeadlineArticlesByTheme(themeId, limit);
    }

    // AI 요약
    @PostMapping("/{articleId}/ai-summary")
    public ResponseEntity<Summary> summarize(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "false") boolean force) {

        Summary summary = aiService.summarizeArticleFromDbAndSave(articleId, force);
        return ResponseEntity.ok(summary);
    }

    // 🔍 검색
    @GetMapping("/search")
    public Page<Article> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return articleService.searchArticles(keyword, PageRequest.of(page, size));
    }
}
