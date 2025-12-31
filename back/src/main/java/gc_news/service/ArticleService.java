package gc_news.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
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

        // 이미 본문이 있으면 그대로 반환 (네이버에 다시 안 다녀옴)
        if (article.getContent() != null && !article.getContent().isBlank()) {
            return article;
        }

        // 원문 URL 없으면 크롤링 불가 → 그냥 반환
        String url = article.getUrlString();
        if (url == null || url.isBlank()) {
            return article;
        }

        try {
            // 1) 네이버 기사 페이지 HTML 가져오기
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0") // 차단 방지용 UA
                    .get();

            // 2) 기자 연결 + 프로필 크롤링까지 수행
            attachReporterFromArticlePage(doc, article);

            // 3) 본문 영역 선택 (네이버 뉴스 구조에 맞춰 selector 여러 개 시도)
            Element body = doc.selectFirst(
                    "#newsct_article, " + // 네이버 뉴스(신규)
                            "#articleBodyContents, " + // 네이버 뉴스(구)
                            ".newsct_article" // 예비 selector
            );

            String html;
            if (body != null && !body.text().isBlank()) {
                html = body.html();
            } else {
                html = "<p>기사 본문을 불러오지 못했습니다. "
                        + "<a href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">"
                        + "원문 기사 바로가기</a></p>";
            }

            // 4) 엔티티에 저장 후 DB 반영
            article.setContent(html);
            articleRepository.save(article);

        } catch (Exception e) {
            // 크롤링 실패해도 전체 요청이 죽지 않도록 예외는 잡기만
            e.printStackTrace();

            String fallback = "<p>기사 본문을 불러오는 중 오류가 발생했습니다. "
                    + "<a href=\"" + article.getUrlString() + "\" target=\"_blank\" rel=\"noopener noreferrer\">"
                    + "원문 기사 바로가기</a></p>";

            article.setContent(fallback);
            articleRepository.save(article);
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
                // 2) themeId가 넘어온 경우, 해당 테마만 필터
                .filter(a -> themeId == null
                        || (a.getTheme() != null
                                && a.getTheme().getThemeId() != null
                                && themeId.equals(a.getTheme().getThemeId())))
                // 3) 날짜 기준 최신순 정렬 (publishedAt 내림차순)
                .sorted(Comparator.comparing(Article::getPublishedAt).reversed())
                // 4) 상위 limit개만 사용
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
                // 3) themeId 별로 그룹핑
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

    // 카테고리별 최신 기사 (페이지네이션)
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByTheme(Long themeId, Pageable pageable) {
        // 이미 CategoryPage 가 잘 뜬다고 했으니,
        // ArticleRepository 안에 이 메서드가 정의되어 있다고 가정.
        return articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(themeId, pageable);
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

    /**
     * 기사 상세 HTML에서 기자를 찾아 Article에 연결 + 기자 프로필 크롤링
     */
    @Transactional
    public void attachReporterFromArticlePage(Document document, Article article) {

        // 1) 기자 링크 찾기
        Element reporterElement = document.selectFirst("a[href*=/journalist/]");

        if (reporterElement == null) {
            // 기자 없는 기사 (속보, 연합뉴스 일부 등)
            return;
        }

        String journalistUrl = reporterElement.attr("href");
        // 예: https://media.naver.com/journalist/655/81986
        String externalJournalistId = extractJournalistId(journalistUrl); // "81986"
        String officeId = extractOfficeId(journalistUrl); // "655"

        if (externalJournalistId == null) {
            return; // 이상한 URL이면 그냥 기자 연결 안 함
        }

        String rawReporterName = reporterElement.text().trim(); // 초기 이름
        // "기자", "특파원" 등 제거
        String reporterName = rawReporterName.replaceAll("\\s*(기자|특파원|논설위원|편집위원)\\s*$", "").trim();
        String press = article.getPress(); // 기사에 이미 저장된 한글 언론사 이름

        // 2) DB에서 기자 찾거나 신규 생성
        Reporter reporter = reporterRepository
                .findByExternalJournalistId(externalJournalistId)
                .orElseGet(() -> Reporter.builder()
                        .externalJournalistId(externalJournalistId)
                        .name(reporterName)
                        .press(press)
                        .officeId(officeId)
                        .build());

        // 기존 기자인데 officeId 비어 있으면 채우기
        if (reporter.getOfficeId() == null && officeId != null) {
            reporter.setOfficeId(officeId);
        }

        // 3) 기자 카드에서 이름/사진 크롤링 → Reporter 필드 업데이트
        Reporter enriched = reporterArticleCrawlingService.crawlReporterProfile(reporter);

        // 4) DB에 저장
        Reporter saved = reporterRepository.save(enriched);

        // 5) 기사에 기자 연결
        article.setReporter(saved);
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
        if (journalistUrl == null || journalistUrl.isBlank())
            return null;
        String[] parts = journalistUrl.split("/");
        return parts[parts.length - 2]; // "655"
    }

    public Page<Article> searchArticles(String keyword, Pageable pageable) {
        return articleRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                keyword, keyword, pageable);
    }
}
