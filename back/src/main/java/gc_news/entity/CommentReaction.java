package gc_news.entity;

import gc_news.entity.Reaction.ReactionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "comment_id", "user_key" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    /** 로그인 전: 임시 키 / 로그인 후: userId */
    @Column(name = "user_key", nullable = false)
    private String userKey;

    /** like / dislike */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;
}
