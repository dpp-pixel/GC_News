package gc_news.dto;

import gc_news.entity.Article;
import gc_news.entity.Reporter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// 기자 정보를 담는 DTO
record ReporterSummary(
        Long reporterId,
        String name,
        String profileImageUrl,
        String press,
        Integer subscriberCount,
        Integer recommendationCount
) {
    static ReporterSummary from(Reporter reporter) {
        if (reporter == null) return null;
        return new ReporterSummary(
                reporter.getReporterId(),
                reporter.getName(),
                reporter.getProfileImageUrl(),
                reporter.getPress(),
                reporter.getSubscriberCount(),      
                reporter.getRecommendationCount()   
        );
    }
}

public record ArticleDetailResponse(
        Long articleId,
        String title,
        String press,
        String reporterName,              // 기자 이름(문자열) - 하위 호환성 유지
        LocalDateTime publishedAt,
        String contentHtml,               // 실제로는 Article.content를 사용
        List<Map<String, String>> mediaList,
        String thumbnailUrl,  
        ReporterSummary reporter          // 기자 객체 추가
) {

    public static ArticleDetailResponse from(Article article) {

        // 기사 이미지들
        List<Map<String, String>> mediaList =
                article.getMediaList() == null
                        ? List.of()
                        : article.getMediaList().stream()
                        .map(m -> Map.of(
                                "url", m.getUrl(),
                                "mediaType", String.valueOf(m.getMediaType())
                        ))
                        .toList();

        //기자 이름 만들기 (Reporter 엔티티에서 꺼내기)
        String reporterName = null;
        if (article.getReporter() != null) {
            reporterName = article.getReporter().getName();
        }

        // 기자 객체 만들기
        ReporterSummary reporterSummary = ReporterSummary.from(article.getReporter());

        //DB에 저장된 content 를 그대로 본문 HTML로 사용
        String contentHtml = article.getContent();
        if (contentHtml == null) {
            contentHtml = "";
        }

        return new ArticleDetailResponse(
                article.getArticleId(),
                article.getTitle(),
                article.getPress(),
                reporterName,
                article.getPublishedAt(),
                contentHtml,
                mediaList,
                article.getThumbnailUrl(),
                reporterSummary
        );
    }
}
