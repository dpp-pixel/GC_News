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

    public Map<Long, List<Article>> getHotArticlesGroupedByTheme(int days, int limitPerTheme) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        return articleRepository.findHotArticles(from).stream()
                .filter(a -> a.getTheme() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getTheme().getThemeId(),
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> list.stream()
                                        .collect(Collectors.toMap(
                                                Article::getUrlString,
                                                a -> a,
                                                (a, b) -> a,
                                                LinkedHashMap::new))
                                        .values()
                                        .stream()
                                        .limit(limitPerTheme)
                                        .toList())));
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
