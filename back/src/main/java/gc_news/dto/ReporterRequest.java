package gc_news.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReporterRequest {
    private Long reporterId;
    private String externalJournalistId;
    private String name;
    private String email;
    private String profileImageUrl;
    private Float trustScore;
    private String press;
    private String officeId;
    private Integer subscriberCount;
    private Integer recommendationCount;
}
