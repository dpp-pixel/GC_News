package gc_news.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import gc_news.entity.Comment;
import gc_news.entity.Reaction;

public interface CommentRepository extends JpaRepository<Comment, Long> {

        List<Comment> findByArticle_ArticleIdOrderByCreatedAtAsc(Long articleId);

        // long countByArticle_ArticleId(Long articleId);

        // 좋아요 많은순
        @Query("""
                        SELECT c
                        FROM Comment c
                        LEFT JOIN Reaction r
                          ON r.targetType = 'comment'
                         AND r.targetId = c.commentId
                         AND r.reactionType = 'like'
                        WHERE c.article.articleId = :articleId
                        GROUP BY c
                        HAVING COUNT(r) > 0
                        ORDER BY COUNT(r) DESC
                        """)
        List<Comment> findBestComments(
                        @Param("articleId") Long articleId,
                        Pageable pageable);
}
