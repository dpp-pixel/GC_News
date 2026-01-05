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
            User user, // userKey → User 객체
            TargetType targetType,
            Long targetId,
            ReactionType reactionType) {

        validateReaction(targetType, reactionType);

        // 1. 기존 반응 조회
        var existing = reactionRepository
                .findByUserAndTargetTypeAndTargetId(user, targetType, targetId);

        // 2. 같은 반응이면 → 취소
        if (existing.isPresent()) {
            Reaction old = existing.get();

            if (old.getReactionType() == reactionType) {
                reactionRepository.delete(old);
                return;
            }

            // 3. 다른 반응이면 기존 반응 삭제
            reactionRepository.delete(old);
        }

        // 4. 새 반응 저장
        Reaction reaction = Reaction.builder()
                .user(user)
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

    private void validateReaction(TargetType t, ReactionType r) {
        if (t == TargetType.article &&
                (r == ReactionType.happy ||
                        r == ReactionType.sad ||
                        r == ReactionType.angry)) {
            return;
        }
        throw new IllegalArgumentException("사용불가");
    }
}
