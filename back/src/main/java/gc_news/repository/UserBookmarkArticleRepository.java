package gc_news.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gc_news.entity.User;
import gc_news.entity.UserBookmarkArticle;

@Repository
public interface UserBookmarkArticleRepository extends JpaRepository<UserBookmarkArticle, Long> {

    Optional<UserBookmarkArticle> findByUserAndArticle_ArticleId(User user, Long articleId);

    void deleteByUserAndArticle_ArticleId(User user, Long articleId);

    List<UserBookmarkArticle> findByUserOrderByUbaIdDesc(User user);
}
