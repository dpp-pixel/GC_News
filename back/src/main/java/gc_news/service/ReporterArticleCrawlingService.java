package gc_news.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.repository.ReporterRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporterArticleCrawlingService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ReporterRepository reporterRepository;
    private final AiService aiService;

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
                    reporter.getExternalJournalistId());

            System.out.println("[DEBUG] 기자 기사 목록 크롤링 시작: " + journalistPageUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(journalistPageUrl))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Document doc = Jsoup.parse(response.body());

            List<Article> articles = new ArrayList<>();

            // 기자 페이지의 기사 목록 li
            var articleElements = doc.select("li.press_edit_news_item");

            System.out.println("[DEBUG] 찾은 기사 수: " + articleElements.size());

            for (Element elem : articleElements) {
                try {
                    String liClass = elem.className(); // as_thumb / as_no_thumb 확인용

                    // 제목과 링크 추출
                    Element linkEl = elem.selectFirst("a.press_edit_news_link");
                    if (linkEl == null) {
                        System.out.println("[DEBUG] linkEl 없음: " + elem.outerHtml());
                        continue;
                    }

                    String title = linkEl.text().trim();
                    String articleUrl = linkEl.attr("href");

                    if (title.isBlank() || articleUrl.isBlank())
                        continue;

                    // 썸네일 추출
                    Element thumbImgEl = elem.selectFirst("span.press_edit_news_thumb img");
                    String thumbUrl = null;
                    if (thumbImgEl != null) {
                        // data-src / data-lazy-src 를 먼저 보고, 없으면 src 사용
                        thumbUrl = firstNonBlank(
                                thumbImgEl.attr("data-src"),
                                thumbImgEl.attr("data-lazy-src"),
                                thumbImgEl.attr("data-srcset"),
                                thumbImgEl.attr("src"));

                        // placeholder(data:image...)면 버리기
                        if (thumbUrl != null && thumbUrl.startsWith("data:image")) {
                            System.out.println("[DEBUG] placeholder 썸네일이라 무시: " + thumbUrl);
                            thumbUrl = null;
                        }

                        thumbUrl = normalizeUrl(thumbUrl); // // 로 시작하면 https: 붙이는 너 기존 함수
                        System.out.println("[DEBUG] 썸네일 최종 URL: " + thumbUrl);
                    } else {
                        System.out.println("[DEBUG] 썸네일 img 태그 없음: " + elem.outerHtml());
                    }

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
                                    .thumbnailUrl(thumbUrl) // 엔티티에 이 필드 있어야 함
                                    .build());

                } catch (Exception e) {
                    System.err.println("[WARN] 기사 항목 파싱 실패: " + e.getMessage());
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

    /**
     * 기자의 신뢰도를 분석합니다. (병렬 처리, DB 저장 없음)
     * @param reporterId 기자 ID
     * @param articles 분석할 기사 목록 (기자 페이지에서 크롤링한 기사들)
     * @return 평균 신뢰도 점수
     */
    public Float analyzeReporterTrustScore(Long reporterId, List<Article> articles) {
        if (articles == null || articles.isEmpty()) {
            throw new IllegalArgumentException("분석할 기사가 없습니다.");
        }

        Reporter reporter = reporterRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("기자를 찾을 수 없습니다: " + reporterId));

        System.out.println("[기자 신뢰도 분석] 시작 - 기자: " + reporter.getName());
        System.out.println("[기자 신뢰도 분석] 분석할 기사 수: " + articles.size());

        // 병렬 처리를 위한 ExecutorService (10개 스레드 풀)
        ExecutorService executor = Executors.newFixedThreadPool(10);

        try {
            // 모든 기사를 병렬로 처리
            List<CompletableFuture<Integer>> futures = articles.stream()
                    .map(crawledArticle -> CompletableFuture.supplyAsync(() -> {
                        String url = crawledArticle.getUrlString();
                        String title = crawledArticle.getTitle();

                        try {
                            System.out.println("[처리 중] " + title);

                            // 1. 본문 크롤링 (DB 저장 없음)
                            String content = crawlArticleContent(url);
                            if (content == null || content.isBlank()) {
                                System.out.println("[실패] 본문 크롤링 실패: " + title);
                                return null;
                            }

                            // 2. AI 분석 (본문을 직접 전달)
                            Integer score = analyzeArticleContent(title, content);
                            if (score != null) {
                                System.out.println("[완료] " + title + " - 점수: " + score + "점");
                            } else {
                                System.out.println("[실패] AI 분석 실패: " + title);
                            }

                            return score;

                        } catch (Exception e) {
                            System.err.println("[오류] " + title + " - " + e.getMessage());
                            return null;
                        }
                    }, executor))
                    .collect(Collectors.toList());

            // 모든 작업 완료 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // 점수 수집 (null 제외)
            List<Integer> scores = futures.stream()
                    .map(CompletableFuture::join)
                    .filter(score -> score != null)
                    .collect(Collectors.toList());

            if (scores.isEmpty()) {
                throw new IllegalStateException("유효한 점수가 없습니다.");
            }

            float averageScore = (float) scores.stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);

            System.out.println("[기자 신뢰도 분석] 완료 - 평균 점수: " + averageScore + "점 (분석된 기사: " + scores.size() + "개)");

            // Reporter의 trustScore 업데이트
            reporter.setTrustScore(averageScore);
            reporterRepository.save(reporter);

            return averageScore;

        } finally {
            executor.shutdown();
        }
    }

    /**
     * 기사 본문을 AI로 분석하여 신뢰도 점수 반환
     */
    private Integer analyzeArticleContent(String title, String content) {
        try {
            // HTML 태그 제거
            String cleanedContent = Jsoup.parse(content).text();

            // 제목 + 본문 조합
            String input = String.format("[제목]\n%s\n\n[본문]\n%s", title, cleanedContent);

            // AI 분석 (AiService의 summarizeArticle 메서드 사용)
            String resultText = aiService.summarizeArticle(input);

            // 점수 추출 (정규식으로 "점수: XX점" 패턴 찾기)
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("점수:\\s*(\\d+)점");
            java.util.regex.Matcher matcher = pattern.matcher(resultText);

            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }

            return null;

        } catch (Exception e) {
            System.err.println("AI 분석 중 오류: " + e.getMessage());
            return null;
        }
    }

    /**
     * 네이버 뉴스 URL에서 본문 크롤링
     */
    private String crawlArticleContent(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .get();

            // 네이버 뉴스 본문 선택자
            Element body = doc.selectFirst(
                    "#newsct_article, " +
                    "#articleBodyContents, " +
                    ".newsct_article, " +
                    "#articeBody"
            );

            if (body != null) {
                // 불필요한 요소 제거
                body.select("script, style, .ad, .relation_news").remove();
                return body.html();
            } else {
                System.err.println("본문 엘리먼트를 찾을 수 없습니다: " + url);
                return null;
            }

        } catch (Exception e) {
            System.err.println("본문 크롤링 실패: " + url + " - " + e.getMessage());
            return null;
        }
    }
}
