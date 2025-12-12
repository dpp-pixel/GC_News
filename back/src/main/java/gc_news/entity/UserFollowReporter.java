package gc_news.entity;

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
public class UserFollowReporter {

<<<<<<< HEAD
}
=======
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ufrId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private Reporter reporter;
}
>>>>>>> 2cba6169084260fcbd72b1783065efa6d58cb006
