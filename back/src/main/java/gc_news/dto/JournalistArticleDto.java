package gc_news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalistArticleDto {

    private String title;       // 기사 제목
    private String url;         // 기사 URL
    private String press;       // 언론사 이름 (한글, 예: "한국경제")
    private String thumbnail;   // 썸네일 URL (없으면 null)
}