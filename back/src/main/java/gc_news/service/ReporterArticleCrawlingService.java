package gc_news.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporterArticleCrawlingService {

    private final ObjectMapper objectMapper;

    public List<Article> crawlReporterArticles(Reporter reporter) {
        try {
            String url = String.format(
                "https://media.naver.com/api/journalist/articles?officeId=%s&journalistId=%s&page=1&pageSize=20",
                reporter.getPress(),             
                reporter.getExternalJournalistId() // journalistId
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode articlesNode = root.path("result").path("articles");

            List<Article> articles = new ArrayList<>();

            for (JsonNode node : articlesNode) {
                articles.add(
                    Article.builder()
                        .title(node.path("title").asText())
                        .urlString(node.path("linkUrl").asText())
                        .publishedAt(LocalDateTime.now()) // 정확한 파싱은 나중에
                        .press(reporter.getPress())
                        .reporter(reporter)               // 관계는 연결
                        .build()
                );
            }

            return articles;

        } catch (Exception e) {
            throw new RuntimeException("기자 기사 크롤링 실패", e);
        }
    }
}
