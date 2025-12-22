package gc_news.dto;

import gc_news.entity.Article;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ArticleDetailResponse(
        Long articleId,
        String title,
        String press,
        String reporterName,              // 기자 이름(문자열)
        LocalDateTime publishedAt,
        String contentHtml,               // 실제로는 Article.content를 사용
        List<Map<String, String>> mediaList
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

        // ✅ 기자 이름 만들기 (Reporter 엔티티에서 꺼내기)
        String reporterName = null;
        if (article.getReporter() != null) {
            // Reporter 엔티티에 필드명이 name 이라고 가정
            reporterName = article.getReporter().getName();
            // 만약 필드명이 다르면 여기 한 줄만 바꿔주면 됩니다.
        }

        // ✅ DB에 저장된 content 를 그대로 본문 HTML로 사용
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
                mediaList
        );
    }
}
