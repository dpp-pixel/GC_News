package gc_news.service;

import gc_news.entity.Reaction;
import gc_news.entity.Reaction.TargetType;
import gc_news.entity.Reaction.ReactionType;
import gc_news.entity.User;
import gc_news.repository.ArticleReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleReactionService {

    private final ArticleReactionRepository reactionRepository;

    /**
     * 기사 / 댓글 반응 등록
     */
    public void react(
            String userKey,
            TargetType targetType,
            Long targetId,
            ReactionType reactionType) {
        // 1. 타겟별 허용 리액션 검증
        validateReaction(targetType, reactionType);

        // 2. 기존 반응 제거 (같은 유저, 같은 타겟)
        reactionRepository.deleteByUserKeyAndTargetTypeAndTargetId(
                userKey, targetType, targetId);

        // 3. 반응 저장
        Reaction reaction = Reaction.builder()
                .userKey(userKey)
                .targetType(targetType)
                .targetId(targetId)
                .reactionType(reactionType)
                .build();

        reactionRepository.save(reaction);
    }

    @Transactional(readOnly = true)
    public Map<ReactionType, Long> getArticleReactionCounts(Long articleId) {
        List<Object[]> result = reactionRepository.countByArticle(articleId);

        Map<ReactionType, Long> counts = new EnumMap<>(ReactionType.class);
        for (Object[] row : result) {
            counts.put((ReactionType) row[0], (Long) row[1]);
        }
        return counts;
    }

    /**
     * 타겟별 리액션 허용 규칙
     */
    private void validateReaction(TargetType t, ReactionType r) {
        if (t == TargetType.comment && (r == ReactionType.like || r == ReactionType.dislike))
            return;
        if (t == TargetType.article && r != ReactionType.like && r != ReactionType.dislike)
            return;
        throw new IllegalArgumentException("사용불가");
    }
}
