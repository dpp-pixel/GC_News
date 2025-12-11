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
    public String getNews(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "10") int display,
            @RequestParam(defaultValue = "date") String sort) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.add("X-Naver-Client-Id", clientId);
            headers.add("X-Naver-Client-Secret", clientSecret);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            String q = (query == null || query.isEmpty()) ? "" : query;

            String url = NAVER_URL +
                    "?query=" + URLEncoder.encode(q, "UTF-8") +
                    "&display=" + display +
                    "&sort=" + sort;

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            return response.getBody();
        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
