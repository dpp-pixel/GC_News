package entity;

import java.time.LocalDateTime;

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
public class Youtube {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long youtubeId;

    private String youtubeUrl;
    private String title;
    private String thumbnail;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "theme_id")
    private Theme theme;
}
