package gc_news.controller;

import gc_news.entity.Reporter;
import gc_news.entity.User;
import gc_news.service.ReporterSubscriptionService;
import gc_news.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ReporterSubscriptionService subscriptionService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me/subscribed-reporters")
    public ResponseEntity<List<Reporter>> getSubscribedReporters(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getUserId();
        List<Reporter> reporters = subscriptionService.getSubscribedReporters(userId);
        return ResponseEntity.ok(reporters);
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            userService.changePassword(user.getUserId(), currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            String password = request.get("password");

            userService.deleteUser(user.getUserId(), password);
            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
