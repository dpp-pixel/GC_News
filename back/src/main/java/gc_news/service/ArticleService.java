package gc_news.service;

import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> getAllArticlesWithMedia() {
        return articleRepository.findAllWithMedia();
    }

    public List<Article> getTopArticlesWithMedia(int limit) {
        return articleRepository.findAllWithMedia()
                .stream()
                .limit(limit)
                .toList();
    }

    public List<Article> getArticlesByTheme(Long themeId) {
        return articleRepository.findByThemeIdOrderByPublishedAtDesc(themeId);
    }
}
