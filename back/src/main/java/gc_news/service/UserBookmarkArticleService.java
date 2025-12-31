package gc_news.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gc_news.entity.Article;
import gc_news.entity.User;
import gc_news.entity.UserBookmarkArticle;
import gc_news.repository.UserBookmarkArticleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBookmarkArticleService {

    private final UserBookmarkArticleRepository repository;

    @Transactional
    public boolean toggleBookmark(User user, Article article) {
        var existing = repository.findByUserAndArticle_ArticleId(user, article.getArticleId());

        if (existing.isPresent()) {
            repository.delete(existing.get());
            return false; // 북마크 해제
        } else {
            repository.save(UserBookmarkArticle.builder()
                    .user(user)
                    .article(article)
                    .build());
            return true; // 북마크 등록
        }
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(User user, Long articleId) {
        return repository.findByUserAndArticle_ArticleId(user, articleId).isPresent();
    }

    @Transactional(readOnly = true)
    public List<Article> getBookmarks(User user) {
        return repository.findBookmarkedArticles(user);
    }

    @Transactional
    public void removeAllBookmarks(User user) {
        repository.deleteAll(repository.findByUser(user));
    }

    @Transactional
    public void deleteBookmark(User user, Long articleId) {
        var bookmark = repository.findByUserAndArticle_ArticleId(user, articleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 북마크입니다."));
        repository.delete(bookmark);
    }
}
