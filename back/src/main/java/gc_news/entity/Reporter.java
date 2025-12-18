package gc_news.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
public class Reporter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reporterId;

    @Column(unique = true)
    private String externalJournalistId; // 네이버 기자 ID

    private String name;
    private String email;
    private String profileImageUrl;
    private Float trustScore;
    private String press;
}