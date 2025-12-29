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
        var existing = repository.findByUser_UserIdAndArticle_ArticleId(user.getUserId(), article.getArticleId());
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
        return repository.findByUser_UserIdAndArticle_ArticleId(user.getUserId(), articleId).isPresent();
    }

    @Transactional(readOnly = true)
    public List<UserBookmarkArticle> getBookmarks(String userId) {
        return repository.findByUser_UserIdOrderByUbaIdDesc(userId);
    }
}
