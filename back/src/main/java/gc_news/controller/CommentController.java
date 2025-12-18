package gc_news.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import gc_news.entity.Comment;
import gc_news.entity.User;
import gc_news.service.CommentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    /* 댓글 작성 */
    @PostMapping
    public Comment createComment(
            @RequestParam Long articleId,
            // @AuthenticationPrincipal User user,
            @RequestBody String content) {
        return commentService.createComment(articleId, content);// user.getUserId(), 로그인 추가시
    }

    /** 기사별 댓글 목록 */
    @GetMapping("/article/{articleId}")
    public List<Comment> getCommentsByArticle(
            @PathVariable Long articleId) {
        return commentService.getCommentsByArticle(articleId);
    }

    /* 댓글 삭제 */
    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @PathVariable Long commentId
    /* ,@AuthenticationPrincipal User user */ ) {
        commentService.deleteComment(commentId);// , user.getUserId()로그인
    }
}
