package gc_news.controller;

import gc_news.entity.Reaction.TargetType;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.User;
import gc_news.service.ArticleReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleReactionController {

    private final ArticleReactionService articleReactionService;

    @PostMapping("/reactions")
    public void react(
            @RequestParam Long articleId,
            @AuthenticationPrincipal User user,
            @RequestParam ReactionType type) {

        articleReactionService.react(
                user,
                TargetType.article,
                articleId,
                type);
    }

    @GetMapping("/{articleId}/reactions")
    public Map<ReactionType, Long> getReactionCounts(
            @PathVariable Long articleId) {

        return articleReactionService.getArticleReactionCounts(articleId);
    }
}
