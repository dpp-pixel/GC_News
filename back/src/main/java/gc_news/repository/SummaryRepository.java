package gc_news.repository;

import gc_news.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SummaryRepository extends JpaRepository<Summary, Long> {

    // articleId 기준으로 최신 Summary 1개 가져오기
    Optional<Summary> findTopByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            Summary.TargetType targetType, Long targetId

    );

    // 여러 기사의 최신 점수를 한 번에 조회 (성능 최적화)
    @Query("""
        SELECT s FROM Summary s
        WHERE s.targetType = :targetType
        AND s.targetId IN :targetIds
        AND s.score IS NOT NULL
        AND s.createdAt = (
            SELECT MAX(s2.createdAt)
            FROM Summary s2
            WHERE s2.targetType = s.targetType
            AND s2.targetId = s.targetId
        )
        """)
    List<Summary> findLatestScoresByTargetIds(
            @Param("targetType") Summary.TargetType targetType,
            @Param("targetIds") List<Long> targetIds
    );
}