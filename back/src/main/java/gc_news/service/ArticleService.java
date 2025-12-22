package gc_news.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    // ✅ 단일 기사 상세 조회
    @Transactional(readOnly = true)
    public Article getArticleById(Long articleId) {
        return articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found: " + articleId));
    }

        // ✅ 상세 조회 시, content 가 비었으면 네이버 원문에서 크롤링해서 채우기
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
                    .userAgent("Mozilla/5.0")   // 차단 방지용 UA
                    .get();

            // 2) 본문 영역 선택 (네이버 뉴스 구조에 맞춰 selector 여러 개 시도)
            Element body = doc.selectFirst(
                    "#newsct_article, " +          // 네이버 뉴스(신규)
                    "#articleBodyContents, " +     // 네이버 뉴스(구)
                    ".newsct_article"              // 예비 selector
            );

            String html;
            if (body != null) {
                html = body.html();
            } else {
                html = "<p>기사 본문을 가져오지 못했습니다. "
                     + "<a href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">"
                     + "원문에서 확인하기</a></p>";
            }

            // 3) 엔티티에 저장 후 DB 반영
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

    // ✅ 전체 기사 (media 포함) - 일단 모든 기사 반환
    @Transactional(readOnly = true)
    public List<Article> getAllArticlesWithMedia() {
        return articleRepository.findAll();
    }

    // ✅ 인기 뉴스 (최근 days일 기준 + 날짜 내림차순 상위 limit개)
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
                .filter(a ->
                        themeId == null
                                || (a.getTheme() != null
                                && a.getTheme().getThemeId() != null
                                && themeId.equals(a.getTheme().getThemeId()))
                )
                // 3) 날짜 기준 최신순 정렬 (publishedAt 내림차순)
                .sorted(Comparator.comparing(Article::getPublishedAt).reversed())
                // 4) 상위 limit개만 사용
                .limit(limit)
                .toList();
    }

    // ✅ 카테고리별 인기 뉴스 그룹 (테마별로 limitPerTheme개씩)
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
                                        .toList()
                        )
                ));
    }

    // ✅ 카테고리별 최신 기사 (페이지네이션)
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByTheme(Long themeId, Pageable pageable) {
        // 이미 CategoryPage 가 잘 뜬다고 했으니,
        // ArticleRepository 안에 이 메서드가 정의되어 있다고 가정.
        return articleRepository.findByTheme_ThemeIdOrderByPublishedAtDesc(themeId, pageable);
    }
}
