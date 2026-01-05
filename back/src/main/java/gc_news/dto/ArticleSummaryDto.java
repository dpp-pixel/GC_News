package gc_news.dto;

import java.time.LocalDateTime;

public record ArticleSummaryDto(
        Long summaryId,
        String summaryText,
        Integer score, 
        LocalDateTime createdAt
) {}