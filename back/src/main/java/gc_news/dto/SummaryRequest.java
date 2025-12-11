package gc_news.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SummaryRequest {
    private String summaryText;
    private Long articleId;
    private Long themeId;
}