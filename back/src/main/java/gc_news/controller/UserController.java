package gc_news.controller;

import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.service.ReporterSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ReporterSubscriptionService subscriptionService;

    @GetMapping("/me/subscribed-reporters")
    public ResponseEntity<List<Reporter>> getSubscribedReporters(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        List<Reporter> reporters = subscriptionService.getSubscribedReporters(userId);
        return ResponseEntity.ok(reporters);
    }
}
