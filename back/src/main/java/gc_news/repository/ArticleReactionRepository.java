package gc_news.repository;

import gc_news.entity.Reaction;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.Reaction.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleReactionRepository
                extends JpaRepository<Reaction, Long> {

        Optional<Reaction> findByUserKeyAndTargetTypeAndTargetId(
                        String userKey,
                        TargetType targetType,
                        Long targetId);

        void deleteByUserKeyAndTargetTypeAndTargetId(
                        String userKey,
                        TargetType targetType,
                        Long targetId);

        @Query("""
                            SELECT r.reactionType, COUNT(r)
                            FROM Reaction r
                            WHERE r.targetType = 'article'
                              AND r.targetId = :articleId
                            GROUP BY r.reactionType
                        """)
        List<Object[]> countByArticle(@Param("articleId") Long articleId);
}
