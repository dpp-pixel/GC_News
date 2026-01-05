package gc_news.service;

import gc_news.config.JwtProvider;
import gc_news.dto.AuthResponse;
import gc_news.dto.UserLoginRequest;
import gc_news.dto.UserSignupRequest;
import gc_news.entity.User;
import gc_news.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public void signup(UserSignupRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        String name = req.getName() != null ? req.getName().trim() : null;
        if (name != null && name.isEmpty()) {
            name = null;
        }

        User user = User.builder()
                .userId(UUID.randomUUID().toString())
                .email(email)
                // password 필드에는 bcrypt 해시를 저장
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.user) // admin은 네가 따로 부여
                .name(name)
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(UserLoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtProvider.createAccessToken(user);
        return new AuthResponse(token, user.getRole()); // role 포함
    }

}