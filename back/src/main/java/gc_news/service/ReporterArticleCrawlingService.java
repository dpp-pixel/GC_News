package gc_news.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporterArticleCrawlingService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;

    // 1) 기자 프로필(이름/사진) 크롤링
    public Reporter crawlReporterProfile(Reporter reporter) {
        try {
            String journalistPageUrl = String.format(
                    "https://media.naver.com/journalist/%s/%s",
                    reporter.getOfficeId(),                 // 655
                    reporter.getExternalJournalistId()      // 81986
            );

            System.out.println("[DEBUG] 기자 프로필 크롤링 시작: " + journalistPageUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(journalistPageUrl))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            Document doc = Jsoup.parse(response.body());

            // 이름 크롤링
            Element nameEl = doc.selectFirst(
                    "em.media_journalistcard_summary_name_text, " +
                    "span.media_journalistcard_summary_name_inner"
            );
            String rawName = nameEl != null ? nameEl.text().trim() : null;
            String name = normalizeReporterName(rawName);
            System.out.println("[DEBUG] 크롤링된 이름 - 원본: " + rawName + " → 정제: " + name);

            // 사진 크롤링
            Element imgEl = doc.selectFirst(
                    "div.media_journalistcard_summary_photo_inner img, " +
                    "a.media_journalistcard_summary_photo img"
            );
            String photoUrl = null;
            if (imgEl != null) {
                photoUrl = firstNonBlank(
                        imgEl.attr("src"),
                        imgEl.attr("data-src"),
                        imgEl.attr("data-lazy-src")
                );
                photoUrl = normalizeUrl(photoUrl);
                System.out.println("[DEBUG] 크롤링된 사진 URL: " + photoUrl);
            } else {
                System.out.println("[DEBUG] 사진 엘리먼트를 찾지 못함");
            }

            if (name != null && !name.isBlank()) {
                reporter.setName(name);
            }
            if (photoUrl != null && !photoUrl.isBlank()) {
                reporter.setProfileImageUrl(photoUrl);
            }

            System.out.println("[DEBUG] 최종 Reporter - name: " + reporter.getName() + ", profileImageUrl: " + reporter.getProfileImageUrl());

            return reporter;

        } catch (Exception e) {
            System.err.println("[ERROR] 기자 프로필 크롤링 실패: " + e.getMessage());
            e.printStackTrace();
            // 크롤링 실패해도 기존 정보 유지
            return reporter;
        }
    }

    // 2) "그 기자가 쓴 기사 목록" 크롤링 (예전 역할)
    public List<Article> crawlReporterArticles(Reporter reporter) {
        try {
            String url = String.format(
                "https://media.naver.com/api/journalist/articles?officeId=%s&journalistId=%s&page=1&pageSize=20",
                reporter.getOfficeId(),               // officeId
                reporter.getExternalJournalistId()    // journalistId
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode articlesNode = root.path("result").path("articles");

            List<Article> articles = new ArrayList<>();

            for (JsonNode node : articlesNode) {
                articles.add(
                    Article.builder()
                        .title(node.path("title").asText())
                        .urlString(node.path("linkUrl").asText())
                        .publishedAt(LocalDateTime.now()) // TODO: 실제 발행일 파싱
                        .press(reporter.getPress())
                        .reporter(reporter)
                        .build()
                );
            }

            return articles;

        } catch (Exception e) {
            throw new RuntimeException("기자 기사 크롤링 실패", e);
        }
    }

    private static String normalizeReporterName(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        // "OOO 기자" 같은 꼬리 제거
        s = s.replaceAll("\\s*기자\\s*$", "").trim();
        // 혹시 "홍길동 특파원" 같은 케이스도 같이 정리하고 싶으면:
        s = s.replaceAll("\\s*(특파원|논설위원|편집위원)\\s*$", "").trim();
        return s.isBlank() ? null : s;
    }

    private static String firstNonBlank(String... candidates) {
        for (String c : candidates) {
            if (c != null && !c.isBlank()) return c;
        }
        return null;
    }

    private static String normalizeUrl(String url) {
        if (url == null) return null;
        String u = url.trim();
        if (u.startsWith("//")) return "https:" + u;
        return u;
    }
}
