package gc_news.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
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

    private String urlString;// url넘기기용

    private String press;// 언론사

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

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ArticleMedia> mediaList;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Comment> comments;

    @Transient
    private String thumbnailUrl;

    @Transient
    private Integer aiScore;



    public void increaseViewCount() {
        this.viewCount = (this.viewCount == null ? 1 : this.viewCount + 1);
    }

}
