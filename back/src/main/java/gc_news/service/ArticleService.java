package gc_news.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import gc_news.entity.Article;
import gc_news.entity.Summary;
import gc_news.repository.ArticleRepository;
import gc_news.repository.SummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.repository.ReporterRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ReporterRepository reporterRepository;
    private final ArticleRepository articleRepository;
    private final ReporterArticleCrawlingService reporterArticleCrawlingService;
    private final SummaryRepository summaryRepository;

    // 단일 기사 상세 조회
    @Transactional(readOnly = true)
    public Article getArticleById(Long articleId) {
        return articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found: " + articleId));
    }

    @Transactional(readOnly = true)
    public List<Article> getHeadlineArticles(int limit) {
        return articleRepository.findHeadlineArticles(
                PageRequest.of(0, limit));
    }

    // 상세 조회 시, content 가 비었으면 네이버 원문에서 크롤링해서 채우기
    @Transactional
    public Article loadArticleContentIfNeeded(Long articleId) {

        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found: " + articleId));

        // 본문과 기자 정보가 모두 있으면 그대로 반환
        boolean hasContent = article.getContent() != null && !article.getContent().isBlank();
        boolean hasReporter = article.getReporter() != null;

        if (hasContent && hasReporter) {
            System.out.println("[DEBUG] 본문과 기자 정보가 이미 존재 - 크롤링 스킵");
            return article;
        }

        // 원문 URL 없으면 크롤링 불가 → 그냥 반환
        String url = article.getUrlString();
        if (url == null || url.isBlank()) {
            return article;
        }

        System.out.println("[DEBUG] 크롤링 필요 - hasContent: " + hasContent + ", hasReporter: " + hasReporter);

        try {
            // 1) 네이버 기사 페이지 HTML 가져오기
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0") // 차단 방지용 UA
                    .get();

            // 2) 기자 정보가 없으면 기자 크롤링
            if (!hasReporter) {
                System.out.println("[DEBUG] 기자 정보 없음 - 크롤링 시작");
                attachReporterFromArticlePage(doc, article);
            }

            // 3) 본문이 없으면 본문 크롤링
            if (!hasContent) {
                System.out.println("[DEBUG] 본문 없음 - 크롤링 시작");
                Element body = doc.selectFirst(
                        "#newsct_article, " + // 네이버 뉴스(신규)
                                "#articleBodyContents, " + // 네이버 뉴스(구)
                                ".newsct_article" // 예비 selector
                );

                String html;
                if (body != null) {
                    html = body.html();
                } else {
                    html = "<p>기사 본문을 가져오지 못했습니다. "
                            + "<a href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">"
                            + "원문에서 확인하기</a></p>";
                }

                article.setContent(html);
            }

            // 4) DB 저장
            articleRepository.save(article);

        } catch (Exception e) {
            // 크롤링 실패해도 전체 요청이 죽지 않도록 예외는 잡기만
            e.printStackTrace();

            if (!hasContent) {
                String fallback = "<p>기사 본문을 불러오는 중 오류가 발생했습니다. "
                        + "<a href=\"" + article.getUrlString() + "\" target=\"_blank\" rel=\"noopener noreferrer\">"
                        + "원문 기사 바로가기</a></p>";

                article.setContent(fallback);
                articleRepository.save(article);
            }
        }

        return article;
    }

    // 전체 기사 (media 포함) - 일단 모든 기사 반환
    @Transactional(readOnly = true)
    public List<Article> getAllArticlesWithMedia() {
        return articleRepository.findAll();
    }

    // 인기 뉴스 (최근 days일 기준 + 날짜 내림차순 상위 limit개)
    @Transactional(readOnly = true)
    public List<Article> getHotArticles(int days, int limit, Long themeId) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        // findAll() 결과를 먼저 지역변수에 담아서 제네릭 타입을 Article로 고정
        List<Article> all = articleRepository.findAll();

        return all.stream()
                // 1) 최근 days 기준으로 필터
                .filter(a -> a.getPublishedAt() != null
                        && !a.getPublishedAt().isBefore(cutoff))
                // 2) 칼럼(Theme 200) 제외
                .filter(a -> a.getTheme() == null
                        || a.getTheme().getThemeId() == null
                        || !Long.valueOf(200L).equals(a.getTheme().getThemeId()))
                // 3) themeId가 넘어온 경우, 해당 테마만 필터
                .filter(a -> themeId == null
                        || (a.getTheme() != null
                                && a.getTheme().getThemeId() != null
                                && themeId.equals(a.getTheme().getThemeId())))
                // 4) 날짜 기준 최신순 정렬 (publishedAt 내림차순)
                .sorted(Comparator.comparing(Article::getPublishedAt).reversed())
                // 5) 상위 limit개만 사용
                .limit(limit)
                .toList();
    }

    // 카테고리별 인기 뉴스 그룹 (테마별로 limitPerTheme개씩)
    @Transactional(readOnly = true)
    public Map<Long, List<Article>> getHotArticlesGroupedByTheme(int days, int limitPerTheme) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        List<Article> all = articleRepository.findAll();

        return all.stream()
                // 1) 최근 days 기준 필터
                .filter(a -> a.getPublishedAt() != null
                        && !a.getPublishedAt().isBefore(cutoff))
                // 2) themeId가 있는 기사만 (null 방지)
                .filter(a -> a.getTheme() != null && a.getTheme().getThemeId() != null)
                // 3) 칼럼(Theme 200) 제외
                .filter(a -> !Long.valueOf(200L).equals(a.getTheme().getThemeId()))
                // 4) themeId 별로 그룹핑
                .collect(Collectors.groupingBy(
                        a -> a.getTheme().getThemeId(),
                        // 4) 각 그룹 안에서 날짜 기준 최신순 상위 limitPerTheme개만 남기기
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> list.stream()
                                        .sorted(Comparator.comparing(Article::getPublishedAt).reversed())
                                        .limit(limitPerTheme)
                                        .toList())));
    }

    @Transactional(readOnly = true)
    public List<Article> getHeadlineArticlesByTheme(Long themeId, int limit) {
        return articleRepository.findHeadlineArticlesByTheme(
                themeId,
                PageRequest.of(0, limit));
    }

    // 카테고리별 최신 기사 (페이지네이션) + AI 점수 포함
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByTheme(Long themeId, Pageable pageable) {
        Page<Article> articles = articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(themeId, pageable);

        // AI 점수 세팅
        enrichArticlesWithAiScores(articles.getContent());

        return articles;
    }

    // 기사 목록에 AI 점수를 세팅하는 헬퍼 메서드
    private void enrichArticlesWithAiScores(List<Article> articles) {
        if (articles == null || articles.isEmpty()) {
            return;
        }

        // 1. 기사 ID 목록 추출
        List<Long> articleIds = articles.stream()
                .map(Article::getArticleId)
                .toList();

        // 2. 한 번에 모든 Summary 조회 (성능 최적화)
        List<Summary> summaries = summaryRepository.findLatestScoresByTargetIds(
                Summary.TargetType.article,
                articleIds
        );

        // 3. articleId -> score 매핑
        Map<Long, Integer> scoreMap = summaries.stream()
                .collect(Collectors.toMap(
                        Summary::getTargetId,
                        Summary::getScore,
                        (existing, replacement) -> existing // 중복 시 기존 값 유지
                ));

        // 4. 각 Article에 점수 세팅
        articles.forEach(article -> {
            Integer score = scoreMap.get(article.getArticleId());
            article.setAiScore(score);
        });
    }

    @Transactional
    public Article getArticleDetail(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("기사 없음"));

        article.increaseViewCount(); // 조회수 +1
        return article;
    }

    @Transactional(readOnly = true)
    public List<Article> getLatestArticles(int limit) {
        return articleRepository.findTopLatestArticles(PageRequest.of(0, limit));
    }

    // 칼럼 조회 (Theme 200)
    @Transactional(readOnly = true)
    public List<Article> getLatestColumns(int limit) {
        return articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(200L, PageRequest.of(0, limit))
                .getContent();
    }

    /**
     * 기사 상세 HTML에서 기자를 찾아 Article에 연결 + 기자 프로필 크롤링
     */
    @Transactional
public void attachReporterFromArticlePage(Document document, Article article) {

    System.out.println("[DEBUG] ===== 기자 정보 크롤링 시작 =====");

    // 1) 기자 링크로 ID/officeId 추출
    Element reporterElement = document.selectFirst("a[href*=/journalist/]");
    if (reporterElement == null) {
        System.out.println("[DEBUG] 기자 링크를 찾지 못함 (reporterElement == null)");
        return;
    }

    String journalistUrl = reporterElement.attr("href");
    System.out.println("[DEBUG] 기자 링크 URL: " + journalistUrl);

    String externalJournalistId = extractJournalistId(journalistUrl);
    String officeId             = extractOfficeId(journalistUrl);
    System.out.println("[DEBUG] journalistId: " + externalJournalistId + ", officeId: " + officeId);

    if (externalJournalistId == null) {
        System.out.println("[DEBUG] journalistId 추출 실패");
        return;
    }

    // 2) 기사 페이지에서 이름 추출
    Element nameEl = document.selectFirst(
            "em.media_end_head_journalist_name, " +
            "span.media_end_head_journalist_name, " +
            "div.media_end_head_journalist_layer_thumb span.blind"
    );
    String rawName = nameEl != null ? nameEl.text().trim() : null;
    String reporterName = normalizeReporterName(rawName);
    System.out.println("[DEBUG] 기사 페이지 이름 - 원본: " + rawName + " → 정제: " + reporterName);

    // 3) 기사 페이지에서 이미지 추출 시도
    Element imgEl = document.selectFirst(
            "div.media_end_head_journalist_layer_thumb img"
    );
    String photoUrl = null;

    if (imgEl != null) {
        // 기사 페이지에서 이미지를 찾음
        System.out.println("[DEBUG] 기사 페이지에서 이미지 엘리먼트 찾음!");
        System.out.println("[DEBUG] img src: " + imgEl.attr("src"));
        System.out.println("[DEBUG] img data-src: " + imgEl.attr("data-src"));
        System.out.println("[DEBUG] img data-lazy-src: " + imgEl.attr("data-lazy-src"));

        photoUrl = firstNonBlank(
                imgEl.attr("src"),
                imgEl.attr("data-src"),
                imgEl.attr("data-lazy-src")
        );
        photoUrl = normalizeUrl(photoUrl);
        System.out.println("[DEBUG] 최종 photoUrl: " + photoUrl);

    } else {
        // 기사 페이지에서 이미지 못 찾음 → 기자 프로필 페이지에서 이미지만 크롤링
        System.out.println("[DEBUG] 기사 페이지에서 이미지 못 찾음 → 기자 프로필 페이지에서 이미지 크롤링 시도");

        Reporter tempReporter = Reporter.builder()
                .externalJournalistId(externalJournalistId)
                .officeId(officeId)
                .build();

        Reporter enriched = reporterArticleCrawlingService.crawlReporterProfile(tempReporter);
        photoUrl = enriched.getProfileImageUrl();

        System.out.println("[DEBUG] 프로필 페이지에서 이미지 크롤링 완료 - photoUrl: " + photoUrl);
    }

    String press = article.getPress();

    // 4) DB에서 기자 찾거나 생성 (람다 X)
    Reporter reporter = reporterRepository
            .findByExternalJournalistId(externalJournalistId)
            .orElse(null);

    if (reporter == null) {
        // 신규 기자
        reporter = Reporter.builder()
                .externalJournalistId(externalJournalistId)
                .officeId(officeId)
                .name(reporterName)
                .press(press)
                .profileImageUrl(photoUrl)
                .build();
    } else {
        // 기존 기자 → 비어 있는 값만 채워주기
        if ((reporter.getOfficeId() == null || reporter.getOfficeId().isBlank())
                && officeId != null) {
            reporter.setOfficeId(officeId);
        }
        if ((reporter.getName() == null || reporter.getName().isBlank())
                && reporterName != null && !reporterName.isBlank()) {
            reporter.setName(reporterName);
        }
        if ((reporter.getProfileImageUrl() == null || reporter.getProfileImageUrl().isBlank())
                && photoUrl != null && !photoUrl.isBlank()) {
            reporter.setProfileImageUrl(photoUrl);
        }
        if (reporter.getPress() == null && press != null) {
            reporter.setPress(press);
        }
    }

    Reporter saved = reporterRepository.save(reporter);
    System.out.println("[DEBUG] DB 저장 완료 - Reporter ID: " + saved.getReporterId() +
                       ", name: " + saved.getName() +
                       ", profileImageUrl: " + saved.getProfileImageUrl());

    // 5) 기사에 연결
    article.setReporter(saved);
    System.out.println("[DEBUG] ===== 기자 정보 크롤링 완료 =====");
}

    private String extractJournalistId(String journalistUrl) {
        // 예: https://media.naver.com/journalist/655/81986
        if (journalistUrl == null || journalistUrl.isBlank()) {
            return null;
        }
        String[] parts = journalistUrl.split("/");
        return parts[parts.length - 1]; // "81986"
    }

    private String extractOfficeId(String journalistUrl) {
    // 예: https://media.naver.com/journalist/655/81986
    if (journalistUrl == null || journalistUrl.isBlank()) return null;
    String[] parts = journalistUrl.split("/");
    return parts[parts.length - 2]; // "655"
}
// 이름 정제
private static String normalizeReporterName(String raw) {
    if (raw == null) return null;
    String s = raw.trim();
    s = s.replaceAll("\\s*(기자|특파원|논설위원|편집위원)\\s*$", "").trim();
    return s.isBlank() ? null : s;
}

// 여러 후보 중 첫 번째 non-blank
private static String firstNonBlank(String... candidates) {
    for (String c : candidates) {
        if (c != null && !c.isBlank()) return c;
    }
    return null;
}

// //로 시작하는 URL 처리
private static String normalizeUrl(String url) {
    if (url == null) return null;
    String u = url.trim();
    if (u.startsWith("//")) return "https:" + u;
    return u;
}
 public Page<Article> searchArticles(String keyword, Pageable pageable) {
        return articleRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                keyword, keyword, pageable);
        }
}
