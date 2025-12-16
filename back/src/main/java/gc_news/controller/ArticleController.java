package gc_news.controller;

//db조회를 이쪽 담당
import gc_news.entity.Article;
import gc_news.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    // 전체 인기 뉴스
    // 예: /api/articles/hot?days=3&limit=10

    @GetMapping("/hot")
    public List<Article> hotArticles(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "10") int limit) {
        return articleService.getHotArticles(days, limit);
    }

    // 카테고리별 인기 뉴스
    // /api/articles/hot/grouped?days=3&limit=3

    @GetMapping("/hot/grouped")
    public Map<Long, List<Article>> hotArticlesGrouped(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "3") int limit) {
        return articleService.getHotArticlesGroupedByTheme(days, limit);
    }

    @GetMapping
    public List<Article> getAll() {
        return articleService.getAllArticlesWithMedia();
    }

    @GetMapping("/category/{themeId}")
    public List<Article> getArticlesByTheme(@PathVariable Long themeId) {
        return articleService.getArticlesByTheme(themeId);
    }

}