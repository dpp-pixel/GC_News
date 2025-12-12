package gc_news.controller;

//db조회를 이쪽 담당
import gc_news.entity.Article;
import gc_news.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public List<Article> getAll() {
        return articleService.getAllArticles();
    }

    @GetMapping("/top")
    public List<Article> getTopArticles() {
        return articleService.getTopArticles(5); // Top 5
    }
}