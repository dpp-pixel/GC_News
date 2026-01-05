package gc_news.repository;

import gc_news.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SummaryRepository extends JpaRepository<Summary, Long> {

    // articleId 기준으로 최신 Summary 1개 가져오기
    Optional<Summary> findTopByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            Summary.TargetType targetType, Long targetId
            
    );
}