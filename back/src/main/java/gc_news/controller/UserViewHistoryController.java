package gc_news.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import gc_news.entity.User;
import gc_news.entity.UserViewHistory;
import gc_news.service.UserViewHistoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserViewHistoryController {

    private final UserViewHistoryService service;

    // 유저가 본 기사 최신순 조회
    @GetMapping("/api/users/me/view-history")
    public List<UserViewHistory> getAllRecentArticles(@AuthenticationPrincipal User user) {
        return service.getAllRecentViews(user.getUserId());
    }

}