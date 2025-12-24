package gc_news.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gc_news.entity.Article;
import gc_news.entity.Comment;
import gc_news.entity.User;
import gc_news.repository.ArticleRepository;
import gc_news.repository.CommentReactionRepository;
import gc_news.repository.CommentRepository;
import gc_news.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final UserRepository userRepository;

    /** 댓글 작성 (로그인 유저 기반) */
    public Comment createComment(Long articleId, String content, String userId) {

        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사 없음"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Comment comment = Comment.builder()
                .article(article)
                .user(user)
                .content(content)
                .build();

        return commentRepository.save(comment);
    }

    /** 베스트 댓글 */
    @Transactional(readOnly = true)
    public List<Comment> getBestComments(Long articleId) {
        return commentRepository.findBestComments(
                articleId,
                PageRequest.of(0, 3)); // 갯수
    }

    /** 최신순 댓글 */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByArticle(Long articleId) {
        return commentRepository.findByArticle_ArticleIdOrderByCreatedAtAsc(articleId);
    }

    /** 댓글 삭제 */
    public void deleteComment(Long commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

        // 유저 확인: 댓글 작성자와 로그인 유저가 같아야 삭제 가능
        if (!comment.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        commentReactionRepository.deleteByComment(comment);
        commentRepository.delete(comment);
    }

    /** 로그인 사용자 댓글 최신순 조회 (무한 스크롤용) */
    @Transactional(readOnly = true)
    public List<Comment> getUserComments(String userId, int page, int size) {
        return commentRepository.findByUser_UserIdOrderByCreatedAtDesc(
                userId,
                PageRequest.of(page, size));
    }

    /** 로그인 사용자 댓글 개수 */
    @Transactional(readOnly = true)
    public Long countUserComments(String userId) {
        return commentRepository.countByUser_UserId(userId);
    }
}
