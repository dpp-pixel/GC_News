package project_gc.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.net.URLEncoder;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Value("${naver.clientid}")
    private String clientId;

    @Value("${naver.clientsecret}")
    private String clientSecret;

    private final String NAVER_URL = "https://openapi.naver.com/v1/search/news.json";

    @GetMapping
    public String getNews(@RequestParam String query) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.add("X-Naver-Client-Id", clientId);
            headers.add("X-Naver-Client-Secret", clientSecret);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = NAVER_URL + "?query=" + URLEncoder.encode(query, "UTF-8") + "&display=5&sort=date";

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            return response.getBody(); // JSON 그대로 반환

        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
