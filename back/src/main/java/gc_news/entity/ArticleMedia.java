package gc_news.entity;



import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class ArticleMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long articleMediaId;

    @Enumerated(EnumType.STRING)
    private MediaType mediaType;

    private String url;

    @ManyToOne
    @JoinColumn(name = "article_id")
    private Article article;

    public enum MediaType {
        image, video
    }
}
