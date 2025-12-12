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
public class Reaction {

<<<<<<< HEAD
}
=======
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reactionId;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private Long targetId;

    @Enumerated(EnumType.STRING)
    private ReactionType reactionType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public enum TargetType { article, comment }
    public enum ReactionType { like, dislike, happy, sad, angry }
}
>>>>>>> 2cba6169084260fcbd72b1783065efa6d58cb006
