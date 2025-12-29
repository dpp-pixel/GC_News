package gc_news.controller;

import gc_news.entity.Reaction;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.User;
import gc_news.service.CommentReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments/reactions")
public class CommentReactionController {

    private final CommentReactionService commentReactionService;

    @PostMapping
    public ResponseEntity<String> toggleReaction(
            @RequestParam Long commentId,
            @RequestParam String type,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        Reaction.ReactionType reactionType;
        try {
            reactionType = parseCommentReactionType(type);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("댓글에서 지원하지 않는 반응 타입입니다: " + type);
        }

        try {
            commentReactionService.toggleReaction(commentId, user, reactionType);
            return ResponseEntity.ok("댓글 반응 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("댓글 반응 실패: " + e.getMessage());
        }
    }

    /**
     * 댓글에서 허용되는 like/dislike 타입만 안전하게 변환
     */
    private Reaction.ReactionType parseCommentReactionType(String type) {
        if (type == null)
            throw new IllegalArgumentException("type이 null입니다.");
        type = type.trim().toLowerCase();

        switch (type) {
            case "like":
                return Reaction.ReactionType.like;
            case "dislike":
                return Reaction.ReactionType.dislike;
            default:
                throw new IllegalArgumentException("댓글에서는 like 또는 dislike만 가능합니다.");
        }
    }

}
