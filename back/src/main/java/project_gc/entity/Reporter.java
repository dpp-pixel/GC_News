package project_gc.entity;

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

    private String name;
    private String email;
    private String profileImageUrl;
    private Float trustScore;
}