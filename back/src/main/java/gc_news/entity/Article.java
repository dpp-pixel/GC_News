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

    @ManyToOne
    @JoinColumn(name = "theme_id")
    private Theme theme;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private Reporter reporter;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ArticleMedia> mediaList;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Comment> comments;

    public void increaseViewCount() {
        this.viewCount = (this.viewCount == null ? 1 : this.viewCount + 1);
    }

}