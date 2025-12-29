package gc_news.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import gc_news.entity.Comment;
import gc_news.entity.CommentReaction;
import gc_news.entity.Reaction.ReactionType;

public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {

    void deleteByComment(Comment comment);

    Optional<CommentReaction> findByCommentAndUserKey(Comment comment, String userKey);

    int countByCommentAndType(Comment comment, ReactionType type);

    void deleteByCommentAndUserKey(Comment comment, String userKey);
}
