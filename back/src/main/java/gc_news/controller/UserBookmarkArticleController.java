package gc_news.controller;

import java.util.List;

import gc_news.entity.Article;
import gc_news.entity.User;
import gc_news.entity.UserBookmarkArticle;
import gc_news.repository.ArticleRepository;
import gc_news.service.UserBookmarkArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class UserBookmarkArticleController {

    private final UserBookmarkArticleService bookmarkService;
    private final ArticleRepository articleRepository;

    @PostMapping("/toggle/{articleId}")
    public ResponseEntity<String> toggleBookmark(
            @PathVariable Long articleId,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기사입니다."));

            boolean added = bookmarkService.toggleBookmark(user, article);
            return ResponseEntity.ok(added ? "북마크 추가" : "북마크 제거");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("북마크 토글 실패: " + e.getMessage());
        }
    }

    @GetMapping("/status/{articleId}")
    public ResponseEntity<?> isBookmarked(
            @AuthenticationPrincipal User user,
            @PathVariable Long articleId) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            boolean bookmarked = bookmarkService.isBookmarked(user, articleId);
            return ResponseEntity.ok(bookmarked);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("북마크 조회 실패: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookmarks(@AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            List<Article> bookmarks = bookmarkService.getBookmarks(user)
                    .stream()
                    .map(UserBookmarkArticle::getArticle)
                    .toList();
            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("북마크 리스트 조회 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllBookmarks(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            bookmarkService.removeAllBookmarks(user);
            return ResponseEntity.ok("모든 북마크 삭제 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("북마크 전체 삭제 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/{articleId}")
    public ResponseEntity<String> deleteBookmark(
            @PathVariable Long articleId,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            bookmarkService.deleteBookmark(user, articleId);
            return ResponseEntity.ok("북마크 삭제 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("북마크 삭제 실패: " + e.getMessage());
        }
    }
}
