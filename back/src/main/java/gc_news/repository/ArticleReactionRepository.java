package gc_news.repository;

import gc_news.entity.Reaction;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.Reaction.TargetType;
import gc_news.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleReactionRepository extends JpaRepository<Reaction, Long> {

  // 특정 유저가 특정 타겟(기사)에 남긴 반응 조회
  Optional<Reaction> findByUserAndTargetTypeAndTargetId(
      User user,
      TargetType targetType,
      Long targetId);

  // 특정 유저가 특정 타겟(기사)에 남긴 반응 삭제
  void deleteByUserAndTargetTypeAndTargetId(
      User user,
      TargetType targetType,
      Long targetId);

  // 특정 기사에 대한 좋아요/싫어요 통계 조회
  @Query("""
          SELECT r.reactionType, COUNT(r)
          FROM Reaction r
          WHERE r.targetType = 'article'
            AND r.targetId = :articleId
          GROUP BY r.reactionType
      """)
  List<Object[]> countByArticle(@Param("articleId") Long articleId);
}
