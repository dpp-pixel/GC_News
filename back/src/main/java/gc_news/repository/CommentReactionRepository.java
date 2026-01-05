package gc_news.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import gc_news.entity.Comment;
import gc_news.entity.CommentReaction;
import gc_news.entity.User;
import gc_news.entity.Reaction.ReactionType;

public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {

    void deleteByComment(Comment comment);

    Optional<CommentReaction> findByCommentAndUser(Comment comment, User user);

    int countByCommentAndType(Comment comment, ReactionType type);

    void deleteByCommentAndUser(Comment comment, User user);
}
