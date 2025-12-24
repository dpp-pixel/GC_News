package gc_news.controller;

import gc_news.dto.AuthResponse;
import gc_news.dto.UserLoginRequest;
import gc_news.dto.UserSignupRequest;
import gc_news.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginService loginService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody UserSignupRequest req) {
        loginService.signup(req);
        return ResponseEntity.ok().build();
    }

    // 로그인 (JWT 발급)
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UserLoginRequest req) {
        return ResponseEntity.ok(loginService.login(req));
    }
}