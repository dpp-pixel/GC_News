package gc_news.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gc_news.entity.Comment;
import gc_news.entity.CommentReaction;
import gc_news.entity.Reaction.ReactionType;
import gc_news.repository.CommentReactionRepository;
import gc_news.repository.CommentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentReactionService {

    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;

    /**
     * 댓글 좋아요 / 싫어요 토글
     */
    public void toggleReaction(Long commentId, String userKey, ReactionType type) {

        // 댓글 엔티티 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        // 기존 리액션 조회
        Optional<CommentReaction> existing = commentReactionRepository.findByCommentAndUserKey(comment, userKey);

        // 기존 리액션이 있을 경우
        if (existing.isPresent()) {
            CommentReaction reaction = existing.get();

            // 같은 타입이면 → 취소
            if (reaction.getType() == type) {
                commentReactionRepository.delete(reaction);
            }
            // 다른 타입이면 → 변경
            else {
                reaction.setType(type);
            }
        }
        // 기존 리액션이 없으면 새로 생성
        else {
            CommentReaction reaction = CommentReaction.builder()
                    .comment(comment)
                    .userKey(userKey)
                    .type(type)
                    .build();

            commentReactionRepository.save(reaction);
        }

        // 좋아요 / 싫어요 개수 동기화
        comment.setLikeCount(
                commentReactionRepository.countByCommentAndType(comment, ReactionType.like));
        comment.setDislikeCount(
                commentReactionRepository.countByCommentAndType(comment, ReactionType.dislike));
    }
}
