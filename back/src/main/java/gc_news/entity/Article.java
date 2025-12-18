package gc_news.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long articleId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime publishedAt;

    private Integer viewCount;

    private Float trustWeight;

    private String urlString;//url넘기기용

    private String press;//언론사

     @Column(unique = true)
    private String externalJournalistId; // 네이버 기자 ID


    @ManyToOne
    @JoinColumn(name = "theme_id")
    private Theme theme;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private Reporter reporter;

    /** 테마/섹션 헤드라인 여부 */
    @Builder.Default
    private boolean headline = false;

      /** 관련뉴스(클러스터) 개수 */
    @Builder.Default
    private int clusterCount = 0;

}

