package gc_news.entity;

import jakarta.persistence.Column;
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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reactionId;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private Long targetId;

    @Enumerated(EnumType.STRING)
    private ReactionType reactionType;

    // 로그인 전 임시
    @Column(nullable = false)
    private String userKey;

    // @ManyToOne 로그인 추가후 변경
    // @JoinColumn(name = "user_id")
    // private User user;

    public enum TargetType {
        article, comment
    }

    public enum ReactionType {
        like, dislike, happy, sad, angry
    }
}
