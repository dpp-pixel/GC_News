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

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporterArticleCrawlingService {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    // 1) 기자 프로필(이름/사진) 크롤링
    public Reporter crawlReporterProfile(Reporter reporter) {
        try {
            String journalistPageUrl = String.format(
                    "https://media.naver.com/journalist/%s/%s",
                    reporter.getOfficeId(), // 655
                    reporter.getExternalJournalistId() // 81986
            );

            System.out.println("[DEBUG] 기자 프로필 크롤링 시작: " + journalistPageUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(journalistPageUrl))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            Document doc = Jsoup.parse(response.body());

            // 이름 크롤링
            Element nameEl = doc.selectFirst(
                    "div.media_reporter_basic_text, " +
                            "em.media_journalistcard_summary_name_text, " +
                            "span.media_journalistcard_summary_name_inner");
            String name = nameEl != null ? nameEl.text().trim() : null;
            System.out.println("[DEBUG] 프로필 페이지 이름 (정제 안 함): " + name);

            /* ---------- 사진 크롤링 ---------- */
            // 사진 크롤링 - 기자 프로필 사이드바 기준
            Element imgEl = doc.selectFirst(
                    // 1순위: 프로필 페이지 왼쪽 사이드바 사진
                    "div.media_reporter_basic_photo img," +
                    // 2순위: 예전/다른 레이아웃용 예비 선택자
                            "div.media_journalistcard_summary_photo_inner img");

            // 백업: 혹시라도 위 선택자로 못 잡았을 때, 페이지 내 img 중에서
            // office_logo 는 제외하고 첫 번째 것
            if (imgEl == null) {
                for (Element img : doc.select("img")) {
                    String src = img.attr("src");
                    if (src == null || src.isBlank())
                        continue;
                    if (src.contains("office_logo"))
                        continue; // 로고는 제외
                    imgEl = img;
                    break;
                }
            }

            String photoUrl = null;
            if (imgEl != null) {
                photoUrl = firstNonBlank(
                        imgEl.attr("src"),
                        imgEl.attr("data-src"),
                        imgEl.attr("data-lazy-src"));
                photoUrl = normalizeUrl(photoUrl);
                System.out.println("[DEBUG] 기자 사진 URL: " + photoUrl);
            } else {
                System.out.println("[DEBUG] 기자 사진 img 태그를 찾지 못함");
            }

            if (name != null && !name.isBlank()) {
                reporter.setName(name);
            }
            if (photoUrl != null && !photoUrl.isBlank()) {
                reporter.setProfileImageUrl(photoUrl);
            }

            System.out.println("[DEBUG] 최종 Reporter - name: " + reporter.getName() + ", profileImageUrl: "
                    + reporter.getProfileImageUrl());

            return reporter;

        } catch (Exception e) {
            System.err.println("[ERROR] 기자 프로필 크롤링 실패: " + e.getMessage());
            e.printStackTrace();
            // 크롤링 실패해도 기존 정보 유지
            return reporter;
        }
    }

    // 2) "그 기자가 쓴 기사 목록" 크롤링 - HTML 페이지에서 추출
    public List<Article> crawlReporterArticles(Reporter reporter) {
        try {
            String journalistPageUrl = String.format(
                    "https://media.naver.com/journalist/%s/%s",
                    reporter.getOfficeId(),
                    reporter.getExternalJournalistId()
            );

            System.out.println("[DEBUG] 기자 기사 목록 크롤링 시작: " + journalistPageUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(journalistPageUrl))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Document doc = Jsoup.parse(response.body());

            List<Article> articles = new ArrayList<>();

            // 기자 페이지의 기사 목록 선택자
            var articleElements = doc.select("div.press_edit_news_item, li.press_article_item");

            System.out.println("[DEBUG] 찾은 기사 수: " + articleElements.size());

            for (Element elem : articleElements) {
                try {
                    // 제목과 링크 추출
                    Element linkEl = elem.selectFirst("a.press_edit_news_link, a");
                    if (linkEl == null) continue;

                    String title = linkEl.text().trim();
                    String articleUrl = linkEl.attr("href");

                    if (title.isBlank() || articleUrl.isBlank()) continue;

                    // 상대 경로면 절대 경로로 변환
                    if (articleUrl.startsWith("/")) {
                        articleUrl = "https://n.news.naver.com" + articleUrl;
                    }

                    articles.add(
                            Article.builder()
                                    .title(title)
                                    .urlString(articleUrl)
                                    .publishedAt(LocalDateTime.now()) // TODO: 실제 발행일 파싱
                                    .press(reporter.getPress())
                                    .reporter(reporter)
                                    .build());

                } catch (Exception e) {
                    System.err.println("[WARN] 기사 항목 파싱 실패: " + e.getMessage());
                    continue;
                }
            }

            System.out.println("[DEBUG] 크롤링 완료 - 총 " + articles.size() + "개 기사");
            return articles;

        } catch (Exception e) {
            System.err.println("[ERROR] 기자 기사 크롤링 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("기자 기사 크롤링 실패", e);
        }
    }

    private static String firstNonBlank(String... candidates) {
        for (String c : candidates) {
            if (c != null && !c.isBlank())
                return c;
        }
        return null;
    }

    private static String normalizeUrl(String url) {
        if (url == null)
            return null;
        String u = url.trim();
        if (u.startsWith("//"))
            return "https:" + u;
        return u;
    }
}
