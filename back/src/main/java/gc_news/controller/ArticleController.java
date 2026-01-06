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

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gc_news.dto.ArticleDetailResponse;
import gc_news.entity.Article;
import gc_news.entity.Summary;
import gc_news.service.AiService;
import gc_news.service.ArticleService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final UserViewHistoryService userViewHistoryService;

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

    private final AiService aiService;

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

        // 카테고리별 헤드라인
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
}
