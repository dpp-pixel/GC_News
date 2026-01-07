package gc_news.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import gc_news.dto.CommentRequest;
import gc_news.dto.CommentResponseDto;
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
            @AuthenticationPrincipal User user,
            @RequestBody CommentRequest request) {

        System.out.println("현재 로그인 유저: " + user);// 로그인 확인

        if (user == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다.");
        }

        return commentService.createComment(
                articleId,
                request.getContent(),
                user.getUserId());
    }

    // 베스트 댓글 조회
    @GetMapping("/article/{articleId}/best")
    public List<CommentResponseDto> getBestComments(
            @PathVariable Long articleId) {
        return commentService.getBestCommentsDto(articleId);
    }

    // 최신 댓글 조회
    @GetMapping("/article/{articleId}")
    public List<CommentResponseDto> getCommentsByArticle(
            @PathVariable Long articleId) {
        return commentService.getCommentsByArticleDto(articleId);
    }

    // 로그인 유저 댓글 조회 (페이징 가능)
    @GetMapping
    public List<CommentResponseDto> getMyComments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        // 서비스에서 DTO 리스트 반환
        return commentService.getUserCommentsForDto(user, page, size);
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다.");
        }

        commentService.deleteComment(commentId, user.getUserId());
    }

    // 로그인 유저 댓글 수 조회
    @GetMapping("/count")
    public Long getMyCommentCount(@AuthenticationPrincipal User user) {

        if (user == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다.");
        }

        return commentService.countUserComments(user);
    }

}
