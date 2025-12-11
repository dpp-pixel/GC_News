package gc_news.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReporterRequest {
    private String name;
    private String email;
    private String profileImageUrl;
}
