package gc_news.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .formLogin(login -> login.disable())
                .httpBasic(basic -> basic.disable())

                .authorizeHttpRequests(auth -> auth
                        // ✅ 로그인 없이 허용
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/articles/**",
                                "/api/comments/article/**",
                                "/api/reporters/{reporterId}")
                        .permitAll()

                        // ✅ 로그인 필요
                        .requestMatchers(
                                "/api/comments/**",
                                "/api/bookmarks/**",
                                "/api/reporters/{reporterId}/subscribe",
                                "/api/reporters/{reporterId}/unsubscribe",
                                "/api/reporters/{reporterId}/is-subscribed",
                                "/api/reporters/{reporterId}/recommend",
                                "/api/reporters/{reporterId}/unrecommend",
                                "/api/reporters/{reporterId}/is-recommended",
                                "/api/users/me/**")
                        .authenticated()

                        // 그 외
                        .anyRequest().permitAll())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
