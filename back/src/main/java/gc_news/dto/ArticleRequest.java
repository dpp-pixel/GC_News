package gc_news.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ArticleRequest {
    private String title;
    private String content;
    private String urlString;
    private Long themeId;
}
