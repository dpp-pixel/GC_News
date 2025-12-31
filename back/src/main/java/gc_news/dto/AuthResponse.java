// src/main/java/gc_news/dto/AuthResponse.java
package gc_news.dto;

import gc_news.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String role; // 추가

    public AuthResponse(String accessToken, User.Role role) {
        this.accessToken = accessToken;
        this.role = role.name(); // user / admin
    }
}
