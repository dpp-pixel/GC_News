package gc_news.service;

import java.util.List;

import org.springframework.stereotype.Service;

import gc_news.entity.UserViewHistory;
import gc_news.repository.UserViewHistoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserViewHistoryService {

    private final UserViewHistoryRepository repository;

    public List<UserViewHistory> getAllRecentViews(String userId) {
        return repository.findByUser_UserIdOrderByViewedAtDesc(userId);
    }
}