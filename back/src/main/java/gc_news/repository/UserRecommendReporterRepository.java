package gc_news.repository;

import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.entity.UserRecommendReporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRecommendReporterRepository extends JpaRepository<UserRecommendReporter, Long> {

    Optional<UserRecommendReporter> findByUserAndReporter(User user, Reporter reporter);

    long countByReporter(Reporter reporter);
}
