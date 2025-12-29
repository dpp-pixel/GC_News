package gc_news.controller;

import org.springframework.web.bind.annotation.*;

import gc_news.entity.Reaction.ReactionType;
import gc_news.service.CommentReactionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments/reactions")
public class CommentReactionController {

    private final CommentReactionService commentReactionService;

    /**
     * 댓글 좋아요 / 싫어요 토글
     *
     * @param commentId 댓글 ID
     * @param userKey   임시 유저 키 (쿠키 or localStorage)
     * @param type      LIKE / DISLIKE
     */
    @PostMapping
    public void toggleReaction(
            @RequestParam Long commentId,
            @RequestParam String userKey,
            @RequestParam ReactionType type) {
        commentReactionService.toggleReaction(commentId, userKey, type);
    }

    // @PostMapping
    // public void toggleReaction(
    // @RequestParam Long commentId,
    // @AuthenticationPrincipal User user,
    // @RequestParam ReactionType type
    // ) {
    // commentReactionService.toggleReaction(
    // commentId,
    // user.getUserId().toString(),
    // type
    // );
    // } 로그인 추가시에 지우고 이거로 변경

}
