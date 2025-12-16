package gc_news.service;

import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    // 전체 인기 뉴스 (조회수 순, 최근 days일 기준, 선택적 themeId)
    public List<Article> getHotArticles(int days, int limit, Long themeId) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        List<Article> articles = articleRepository.findHotArticles(from);

        // themeId가 있으면 필터링
        if (themeId != null) {
            articles = articles.stream()
                    .filter(a -> a.getTheme() != null && a.getTheme().getThemeId().equals(themeId))
                    .toList();
        }

        // urlString 기준 중복 제거 및 limit 적용
        Map<String, Article> uniqueMap = new LinkedHashMap<>();
        for (Article article : articles) {
            uniqueMap.putIfAbsent(article.getUrlString(), article);
            if (uniqueMap.size() >= limit)
                break;
        }

        return new ArrayList<>(uniqueMap.values());
    }

    // 카테고리별 인기 뉴스 (themeId별, limitPerTheme)
    public Map<Long, List<Article>> getHotArticlesGroupedByTheme(int days, int limitPerTheme) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        List<Article> articles = articleRepository.findHotArticles(from);

        Map<Long, List<Article>> result = new LinkedHashMap<>();
        for (Article article : articles) {
            if (article.getTheme() == null)
                continue;

            Long themeId = article.getTheme().getThemeId();
            result.putIfAbsent(themeId, new ArrayList<>());

            List<Article> list = result.get(themeId);
            boolean exists = list.stream()
                    .anyMatch(a -> a.getUrlString().equals(article.getUrlString()));

            if (!exists && list.size() < limitPerTheme) {
                list.add(article);
            }
        }

        return result;
    }

    // 모든 기사(media 포함)
    public List<Article> getAllArticlesWithMedia() {
        return articleRepository.findAllWithMedia();
    }

    // 상위 limit만 가져오기
    public List<Article> getTopArticlesWithMedia(int limit) {
        return articleRepository.findAllWithMedia()
                .stream()
                .limit(limit)
                .toList();
    }

    // 카테고리별 최신 기사 (페이지 처리)
    public Page<Article> getArticlesByTheme(Long themeId, Pageable pageable) {
        return articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(themeId, pageable);
    }
}
