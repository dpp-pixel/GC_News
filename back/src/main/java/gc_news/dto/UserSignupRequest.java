package gc_news.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupRequest {
    private String userId;
    private String name;
    private String email;
    private String password;
}