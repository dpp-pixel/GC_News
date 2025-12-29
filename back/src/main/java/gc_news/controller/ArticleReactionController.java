package gc_news.controller;

import gc_news.entity.Reaction;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.Reaction.TargetType;
import gc_news.entity.User;
import gc_news.service.ArticleReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class ArticleReactionController {

    private final ArticleReactionService articleReactionService;

    @PostMapping("/reactions")
    public ResponseEntity<String> react(
            @RequestParam Long articleId,
            @RequestParam String type,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            Reaction.ReactionType reactionType;
            try {
                reactionType = Reaction.ReactionType.valueOf(type.toLowerCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("기사에서 지원하지 않는 감정 타입입니다: " + type);
            }

            // 기사 반응에서는 happy, sad, angry만 허용
            if (reactionType != Reaction.ReactionType.happy &&
                    reactionType != Reaction.ReactionType.sad &&
                    reactionType != Reaction.ReactionType.angry) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("기사에서는 happy, sad, angry만 가능합니다.");
            }

            articleReactionService.react(user, Reaction.TargetType.article, articleId, reactionType);
            return ResponseEntity.ok("기사 감정 반응 완료");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("감정 반응 실패: " + e.getMessage());
        }
    }

    @GetMapping("/{articleId}/reactions")
    public ResponseEntity<?> getReactionCounts(@PathVariable Long articleId) {
        try {
            Map<ReactionType, Long> counts = articleReactionService.getArticleReactionCounts(articleId);
            return ResponseEntity.ok(counts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("반응 조회 실패: " + e.getMessage());
        }
    }
}
