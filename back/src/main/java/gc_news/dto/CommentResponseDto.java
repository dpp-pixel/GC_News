package gc_news.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentResponseDto {
    private Long commentId;
    private String content;
    private LocalDateTime createdAt;
    private int likeCount;
    private int dislikeCount;
    private Long articleId;
    private String articleTitle;
    private String articleImageUrl;

}
