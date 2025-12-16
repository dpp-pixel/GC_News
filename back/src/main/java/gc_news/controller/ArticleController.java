package gc_news.controller;

import gc_news.entity.Article;
import gc_news.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

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

    // 모든 기사 조회 (media 포함)
    @GetMapping
    public List<Article> getAll() {
        return articleService.getAllArticlesWithMedia();
    }

    // 카테고리별 최신 기사 조회 (페이지 처리)
    // 예: /api/articles/category/{themeId}?page=0&size=10
    @GetMapping("/category/{themeId}")
    public Page<Article> getArticlesByTheme(
            @PathVariable Long themeId,
            Pageable pageable) {
        return articleService.getArticlesByTheme(themeId, pageable);
    }
}
