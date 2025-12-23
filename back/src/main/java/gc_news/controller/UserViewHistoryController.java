package gc_news.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import gc_news.entity.Article;
import gc_news.entity.User;
import gc_news.entity.UserViewHistory;
import gc_news.service.UserViewHistoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserViewHistoryController {

    private final UserViewHistoryService service;

    // 유저가 본 기사 최신순 조회 최근 3일간의 기록
    @GetMapping("/api/users/me/view-history")
    public List<Article> getRecentArticles(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "3") int days) {

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return service.getRecentViewedArticles(user.getUserId(), days);
    }

}