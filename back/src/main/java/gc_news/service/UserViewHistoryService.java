package gc_news.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gc_news.entity.Article;
import gc_news.entity.UserViewHistory;
import gc_news.repository.UserViewHistoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserViewHistoryService {

    private final UserViewHistoryRepository repository;

    @Transactional(readOnly = true)
    public List<Article> getRecentViewedArticles(String userId, int days) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        List<UserViewHistory> histories = repository.findByUser_UserIdAndViewedAtAfterOrderByViewedAtDesc(
                userId, cutoff);

        Map<Long, Article> uniqueMap = new LinkedHashMap<>();

        for (UserViewHistory history : histories) {
            if (history.getArticle() == null)
                continue;

            Article article = history.getArticle();
            uniqueMap.putIfAbsent(article.getArticleId(), article);
        }

        return new ArrayList<>(uniqueMap.values());
    }

}