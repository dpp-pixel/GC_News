package gc_news.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gc_news.entity.UserBookmarkArticle;

@Repository
public interface UserBookmarkArticleRepository extends JpaRepository<UserBookmarkArticle, Long> {

    Optional<UserBookmarkArticle> findByUser_UserIdAndArticle_ArticleId(String userId, Long articleId);

    void deleteByUser_UserIdAndArticle_ArticleId(String userId, Long articleId);

    List<UserBookmarkArticle> findByUser_UserIdOrderByUbaIdDesc(String userId);
}
