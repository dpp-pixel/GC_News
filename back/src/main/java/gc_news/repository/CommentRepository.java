package gc_news.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gc_news.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByArticle_ArticleIdOrderByCreatedAtAsc(Long articleId);

    // long countByArticle_ArticleId(Long articleId);
}
