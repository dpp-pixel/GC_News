package gc_news.service;

import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> getHotArticles(int days, int limit) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        // urlString 기준 중복 제거
        Map<String, Article> uniqueMap = new LinkedHashMap<>();

        for (Article article : articleRepository.findHotArticles(from)) {
            uniqueMap.putIfAbsent(article.getUrlString(), article);
            if (uniqueMap.size() >= limit)
                break;
        }

        return new ArrayList<>(uniqueMap.values());
    }

    // 카테고리별 인기 뉴스

    public Map<Long, List<Article>> getHotArticlesGroupedByTheme(
            int days,
            int limitPerTheme) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        List<Article> articles = articleRepository.findHotArticles(from);

        Map<Long, List<Article>> result = new LinkedHashMap<>();

        for (Article article : articles) {
            if (article.getTheme() == null)
                continue;

            Long themeId = article.getTheme().getThemeId();

            result.putIfAbsent(themeId, new ArrayList<>());

            List<Article> list = result.get(themeId);

            // urlString 기준 중복 제거
            boolean exists = list.stream()
                    .anyMatch(a -> a.getUrlString().equals(article.getUrlString()));

            if (!exists && list.size() < limitPerTheme) {
                list.add(article);
            }
        }

        return result;
    }

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
        return articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(themeId);
    }
}
