package gc_news.controller;

import gc_news.entity.Reaction.TargetType;
import gc_news.entity.Reaction.ReactionType;
import gc_news.service.ArticleReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleReactionController {

    private final ArticleReactionService articleReactionService;

    /**
     * 기사 감정 반응
     *
     * @param articleId 기사 ID
     * @param userKey   임시 유저 키
     * @param type      happy / sad / angry
     */
    @PostMapping("/reactions")
    public void react(
            @RequestParam Long articleId,
            @RequestParam String userKey,
            @RequestParam ReactionType type) {

        articleReactionService.react(
                userKey,
                TargetType.article,
                articleId,
                type);
    }

    @GetMapping("/{articleId}/reactions")
    public Map<ReactionType, Long> getReactionCounts(
            @PathVariable Long articleId) {

        return articleReactionService.getArticleReactionCounts(articleId);
    }
    // 로그인 추가 시
    // @PostMapping
    // public void react(
    // @RequestParam Long articleId,
    // @AuthenticationPrincipal User user,
    // @RequestParam ReactionType type
    // ) {
    // articleReactionService.react(
    // TargetType.article,
    // articleId,
    // type
    // );
    // }
}
