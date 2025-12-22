package gc_news.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gc_news.entity.UserViewHistory;

@Repository
public interface UserViewHistoryRepository extends JpaRepository<UserViewHistory, Long> {

    // 특정 유저가 본 기록을 최신순으로 가져오기
    List<UserViewHistory> findByUser_UserIdOrderByViewedAtDesc(String userId);
}
