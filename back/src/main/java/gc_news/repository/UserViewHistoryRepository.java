package gc_news.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gc_news.entity.UserViewHistory;

@Repository
public interface UserViewHistoryRepository extends JpaRepository<UserViewHistory, Long> {

    List<UserViewHistory> findByUser_UserIdAndViewedAtAfterOrderByViewedAtDesc(
            String userId,
            LocalDateTime after);
}
