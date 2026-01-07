package gc_news.service;

import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.entity.UserFollowReporter;
import gc_news.entity.UserRecommendReporter;
import gc_news.repository.ReporterRepository;
import gc_news.repository.UserFollowReporterRepository;
import gc_news.repository.UserRecommendReporterRepository;
import gc_news.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporterSubscriptionService {

    private final UserFollowReporterRepository userFollowReporterRepository;
    private final UserRecommendReporterRepository userRecommendReporterRepository;
    private final ReporterRepository reporterRepository;
    private final UserRepository userRepository;

    @Transactional
    public void subscribeReporter(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        // 이미 구독 중인지 확인
        if (userFollowReporterRepository.findByUserAndReporter(user, reporter).isPresent()) {
            throw new IllegalStateException("이미 구독 중입니다.");
        }

        // 구독 추가
        UserFollowReporter follow = UserFollowReporter.builder()
                .user(user)
                .reporter(reporter)
                .build();
        userFollowReporterRepository.save(follow);

        // 기자의 구독자 수 증가 (null-safe)
        Integer currentCount = reporter.getSubscriberCount();
        reporter.setSubscriberCount(currentCount == null ? 1 : currentCount + 1);
        reporterRepository.save(reporter);
    }

    @Transactional
    public void unsubscribeReporter(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        // 구독 관계 찾기
        UserFollowReporter follow = userFollowReporterRepository.findByUserAndReporter(user, reporter)
                .orElseThrow(() -> new IllegalStateException("구독하지 않은 기자입니다."));

        // 구독 삭제
        userFollowReporterRepository.delete(follow);

        // 기자의 구독자 수 감소 (null-safe)
        Integer currentCount = reporter.getSubscriberCount();
        reporter.setSubscriberCount(currentCount == null ? 0 : Math.max(0, currentCount - 1));
        reporterRepository.save(reporter);
    }

    @Transactional(readOnly = true)
    public List<Reporter> getSubscribedReporters(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        return userFollowReporterRepository.findByUser(user).stream()
                .map(UserFollowReporter::getReporter)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isSubscribed(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        return userFollowReporterRepository.findByUserAndReporter(user, reporter).isPresent();
    }

    @Transactional
    public void recommendReporter(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        // 이미 추천했는지 확인
        if (userRecommendReporterRepository.findByUserAndReporter(user, reporter).isPresent()) {
            throw new IllegalStateException("이미 추천했습니다.");
        }

        // 추천 추가
        UserRecommendReporter recommend = UserRecommendReporter.builder()
                .user(user)
                .reporter(reporter)
                .build();
        userRecommendReporterRepository.save(recommend);

        // 기자의 추천 수 증가 (null-safe)
        Integer currentCount = reporter.getRecommendationCount();
        reporter.setRecommendationCount(currentCount == null ? 1 : currentCount + 1);
        reporterRepository.save(reporter);
    }

    @Transactional
    public void unrecommendReporter(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        // 추천 관계 찾기
        UserRecommendReporter recommend = userRecommendReporterRepository.findByUserAndReporter(user, reporter)
                .orElseThrow(() -> new IllegalStateException("추천하지 않은 기자입니다."));

        // 추천 삭제
        userRecommendReporterRepository.delete(recommend);

        // 기자의 추천 수 감소 (null-safe)
        Integer currentCount = reporter.getRecommendationCount();
        reporter.setRecommendationCount(currentCount == null ? 0 : Math.max(0, currentCount - 1));
        reporterRepository.save(reporter);
    }

    @Transactional(readOnly = true)
    public boolean isRecommended(String userId, Long reporterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다."));

        return userRecommendReporterRepository.findByUserAndReporter(user, reporter).isPresent();
    }
}
