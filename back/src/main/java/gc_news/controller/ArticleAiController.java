package gc_news.controller;

import gc_news.entity.Summary;
import gc_news.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import gc_news.dto.ArticleSummaryDto;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleAiController {

    private final AiService aiService;

    @PostMapping("/{articleId}/ai-summary")
public ResponseEntity<?> summarizeArticle(
        @PathVariable Long articleId,
        @RequestParam(defaultValue = "false") boolean force
) {
    try {
        Summary summary = aiService.summarizeArticleFromDbAndSave(articleId, force);

        ArticleSummaryDto dto = new ArticleSummaryDto(
                summary.getSummaryId(),
                summary.getSummaryText(),
                summary.getScore(), 
                summary.getCreatedAt()
        );

        return ResponseEntity.ok(dto);
    } catch (IllegalArgumentException | IllegalStateException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("SERVER_ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
    }
}
}