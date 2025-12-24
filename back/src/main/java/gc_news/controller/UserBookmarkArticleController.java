package gc_news.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import gc_news.entity.Article;
import gc_news.entity.User;
import gc_news.entity.UserBookmarkArticle;
import gc_news.service.ArticleService;
import gc_news.service.UserBookmarkArticleService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class UserBookmarkArticleController {

    private final UserBookmarkArticleService bookmarkService;
    private final ArticleService articleService;

    // 북마크 토글
    @PostMapping("/toggle/{articleId}")
    public boolean toggleBookmark(@AuthenticationPrincipal User user,
            @PathVariable Long articleId) {
        Article article = articleService.getArticleById(articleId);
        return bookmarkService.toggleBookmark(user, article);
    }

    // 특정 기사 북마크 여부
    @GetMapping("/status/{articleId}")
    public boolean isBookmarked(@AuthenticationPrincipal User user,
            @PathVariable Long articleId) {
        return bookmarkService.isBookmarked(user, articleId);
    }

    // 유저가 저장한 북마크 리스트 조회
    @GetMapping("/my")
    public List<Article> getMyBookmarks(@AuthenticationPrincipal User user) {
        return bookmarkService.getBookmarks(user)
                .stream()
                .map(UserBookmarkArticle::getArticle)
                .toList();
    }
}
