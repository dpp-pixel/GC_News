package gc_news.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import gc_news.entity.User;
import gc_news.entity.Reaction.ReactionType;
import gc_news.service.CommentReactionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments/reactions")
public class CommentReactionController {

    private final CommentReactionService commentReactionService;

    @PostMapping
    public void toggleReaction(
            @RequestParam Long commentId,
            @AuthenticationPrincipal User user,
            @RequestParam ReactionType type) {

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        commentReactionService.toggleReaction(
                commentId,
                user,
                type);

    }
}
