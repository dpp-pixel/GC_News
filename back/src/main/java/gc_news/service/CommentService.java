package gc_news.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gc_news.entity.Article;
import gc_news.entity.Comment;
import gc_news.repository.ArticleRepository;
import gc_news.repository.CommentReactionRepository;
import gc_news.repository.CommentRepository;
//import gc_news.repository.UserRepository;
//import gc_news.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final CommentReactionRepository commentReactionRepository;
    // private final UserRepository userRepository;

    /** 댓글 작성 */
    public Comment createComment(Long articleId, String content) {// Long userId, 추가

        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사 없음"));

        // User user = userRepository.findById(userId)
        // .orElseThrow(() -> new IllegalArgumentException("없는 아이디"));

        Comment comment = Comment.builder()
                .article(article)
                // .user(user)
                .content(content)

                .build();

        return commentRepository.save(comment);
    }

    // 베스트 댓글
    @Transactional(readOnly = true)
    public List<Comment> getBestComments(Long articleId) {
        return commentRepository.findBestComments(
                articleId,
                PageRequest.of(0, 3));// 갯수
    }

    // 최신순
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByArticle(Long articleId) {
        return commentRepository
                .findByArticle_ArticleIdOrderByCreatedAtAsc(articleId);
    }

    // 댓글 삭제
    public void deleteComment(Long commentId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

        commentReactionRepository.deleteByComment(comment);

        commentRepository.delete(comment);
    }
}
