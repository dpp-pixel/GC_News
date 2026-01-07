package gc_news.repository;

import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.entity.UserFollowReporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowReporterRepository extends JpaRepository<UserFollowReporter, Long> {

    // 특정 유저가 특정 기자를 구독하는지 확인
    Optional<UserFollowReporter> findByUserAndReporter(User user, Reporter reporter);

    // 특정 유저가 구독한 모든 기자 목록
    List<UserFollowReporter> findByUser(User user);

    // 특정 기자를 구독하는 유저 수
    long countByReporter(Reporter reporter);
}
