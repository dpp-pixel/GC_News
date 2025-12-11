package project_gc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // ⭐ CORS 활성화
                .csrf(csrf -> csrf.disable()) // CSRF 해제
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .formLogin(login -> login.disable());

        return http.build();
    }
}
