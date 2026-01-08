package gc_news.controller;

import gc_news.dto.AuthResponse;
import gc_news.dto.UserLoginRequest;
import gc_news.dto.UserSignupRequest;
import gc_news.service.LoginService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginService loginService;

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean available = loginService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of("available", available));
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody UserSignupRequest req) {
        loginService.signup(req);
        return ResponseEntity.ok().build();
    }

    // 로그인 (JWT 발급)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest req) {
        try {
            return ResponseEntity.ok(loginService.login(req));
        } catch (IllegalArgumentException e) {
            // 인증 실패: 401 Unauthorized
            return ResponseEntity.status(401)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // 그 외 서버 오류
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "서버 오류"));
        }
    }
}