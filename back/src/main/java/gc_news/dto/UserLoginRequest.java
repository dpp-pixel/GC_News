package gc_news.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserLoginRequest {
    private String email;
    private String password;
    private String role;
}
