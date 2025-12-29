package gc_news.service;

import gc_news.entity.Article;
import gc_news.entity.ArticleMedia;
import gc_news.entity.Theme;
import gc_news.repository.ArticleMediaRepository;
import gc_news.repository.ArticleRepository;
import gc_news.repository.ThemeRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NewsCrawlingService {

    private final ArticleRepository articleRepository;
    private final ThemeRepository themeRepository;
    private final ArticleMediaRepository articleMediaRepository;

    private static final Pattern SECTION_PATTERN = Pattern.compile("/section/(\\d{3})");
    private final AtomicInteger nextSection = new AtomicInteger(0);
    private final AtomicBoolean crawling = new AtomicBoolean(false);

    // 수집할 URL 리스트
    private final String[] urls = {
            "https://news.naver.com/section/100", // 정치
            "https://news.naver.com/section/101", // 경제
            "https://news.naver.com/section/102", // 사회
            "https://news.naver.com/section/103", // 생활/문화
            "https://news.naver.com/section/104", // 세계
            "https://news.naver.com/section/105" // IT/과학
    };

    public NewsCrawlingService(ArticleRepository articleRepository,
            ThemeRepository themeRepository, ArticleMediaRepository articleMediaRepository) {
        this.articleRepository = articleRepository;
        this.themeRepository = themeRepository;
        this.articleMediaRepository = articleMediaRepository;
    }

    /**
     * 전체 섹션 크롤링
     */
    public void crawlSection() {

        // 추가: 이미 실행 중이면 그냥 종료
        if (!crawling.compareAndSet(false, true)) {
            System.out.println("### crawlSection already running - skip");
            return;
        }

        try {
            for (String url : urls) {
                crawlOneSection(url);
            }
        } finally {
            // 추가: 예외가 나도 반드시 락 해제
            crawling.set(false);
        }
    }

    /**
     * 개별 섹션 크롤링
     */
    public void crawlOneSection(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            Elements articles = doc.select(".sa_item");

            for (Element article : articles) {

                // 제목
                String title = article.select(".sa_text_title").text();

                // 링크
                String link = article.select("a").attr("href");
                if (link == null || link.isEmpty())
                    continue;

                // 중복 기사 방지
                if (articleRepository.existsByUrlString(link))
                    continue;

                // 언론사 (여러 패턴 지원)
                String press = article.select(".sa_text_press").text();
                if (press.isEmpty())
                    press = article.select(".sa_text_info_press").text();
                if (press.isEmpty())
                    press = article.select(".press").text();

                // 이미지 (src → data-src 순서)
                String imgUrl = article.select("img").attr("src");
                if (imgUrl == null || imgUrl.isEmpty()) {
                    imgUrl = article.select("img").attr("data-src");
                }
                if (imgUrl == null || imgUrl.isEmpty()) {
                    imgUrl = null;
                }

                // Theme 자동 매핑
                Long themeId = getThemeIdFromUrl(url);
                Theme theme = themeRepository.findById(themeId).orElse(null);

                // 저장
                Article articleEntity = Article.builder()
                        .title(title)
                        .press(press)
                        .urlString(link)
                        .theme(theme)
                        .publishedAt(LocalDateTime.now())
                        .build();

                Article savedArticle = articleRepository.save(articleEntity);

                // 콘솔 출력 (원하면 제거 가능)
                System.out.println("제목: " + title);
                System.out.println("링크: " + link);
                System.out.println("언론사: " + press);
                System.out.println("themeId=" + themeId + ", theme=" + (theme == null ? "null" : theme.getName()));
                System.out.println("------------------------------------");

                ArticleMedia media = ArticleMedia.builder()
                        .mediaType(ArticleMedia.MediaType.image)
                        .url(imgUrl)
                        .article(savedArticle)
                        .build();

                articleMediaRepository.save(media);

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 전 테마(섹션)의 "헤드라인 박스"만 크롤링
     * - 상단 테마 헤드라인용
     * - 메인 페이지 글로벌 헤드라인용(관련뉴스 수 이용)
     */
    public void crawlHeadlineSections() {

        if (!crawling.compareAndSet(false, true)) {
            System.out.println("### crawlHeadlinesOnly already running - skip");
            return;
        }

        try {
            for (String url : urls) {
                crawlHeadlineBoxInSection(url);
            }
        } finally {
            crawling.set(false);
        }
    }

    /**
     * 한 섹션 페이지의 헤드라인 영역만 크롤링
     */
    private void crawlHeadlineBoxInSection(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            Element headlineSection = doc.selectFirst("div.section_article.as_headline");
            if (headlineSection == null) {
                System.out.println("### 헤드라인 섹션을 찾지 못함: " + url);
                return;
            }

            Elements headlineItems = headlineSection.select("li.sa_item");
            System.out.println("헤드라인 기사 개수 = " + headlineItems.size());

            Long themeId = getThemeIdFromUrl(url);
            Theme theme = themeRepository.findById(themeId).orElse(null);

            for (Element item : headlineItems) {

                // 제목 & 링크
                Element titleAnchor = item.selectFirst("div.sa_text a.sa_text_title");
                if (titleAnchor == null)
                    continue;

                String title = titleAnchor.text();
                String link = titleAnchor.attr("href");
                if (link == null || link.isEmpty())
                    continue;

                // 언론사: div.sa_text_info_left > div.sa_text_press
                String press = item.select("div.sa_text_info_left div.sa_text_press").text();

                // 이미지
                String imgUrl = item.select("img").attr("src");
                if (imgUrl == null || imgUrl.isEmpty()) {
                    imgUrl = item.select("img").attr("data-src");
                }
                if (imgUrl != null && imgUrl.isEmpty()) {
                    imgUrl = null;
                }

                // 관련뉴스(클러스터) 개수: div.sa_text_info_right > span.sa_text_cluster_num
                String clusterText = item.select("div.sa_text_info_right span.sa_text_cluster_num").text();
                int clusterCount = 0;
                if (!clusterText.isBlank()) {
                    // 혹시 "72" 말고 "72+" 같은 게 나와도 숫자만 뽑도록
                    String digits = clusterText.replaceAll("[^0-9]", "");
                    if (!digits.isBlank()) {
                        clusterCount = Integer.parseInt(digits);
                    }
                }

                // 이미 존재하는 기사면 headline/clusterCount만 갱신
                Article article = articleRepository.findByUrlString(link).orElse(null);
                if (article != null) {
                    article.setHeadline(true);
                    article.setClusterCount(clusterCount);
                    articleRepository.save(article);
                } else {
                    // 새 기사 저장
                    article = Article.builder()
                            .title(title)
                            .press(press)
                            .urlString(link)
                            .theme(theme)
                            .publishedAt(LocalDateTime.now()) // 필요하면 상세 페이지에서 다시 갱신
                            .headline(true)
                            .clusterCount(clusterCount)
                            .build();

                    Article savedArticle = articleRepository.save(article);

                    if (imgUrl != null) {
                        ArticleMedia media = ArticleMedia.builder()
                                .mediaType(ArticleMedia.MediaType.image)
                                .url(imgUrl)
                                .article(savedArticle)
                                .build();
                        articleMediaRepository.save(media);
                    }
                }

                System.out.printf("[HEADLINE] theme=%d, cluster=%d, title=%s%n",
                        themeId, clusterCount, title);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * URL 기반으로 theme 자동 할당
     */
    private Long getThemeIdFromUrl(String url) {

        if (url == null)
            return 100L;

        Matcher m = SECTION_PATTERN.matcher(url);
        if (!m.find())
            return 100L;

        return Long.parseLong(m.group(1)); // 100~105 그대로 반환
    }

    public void crawlNextSection() {

        if (!crawling.compareAndSet(false, true)) {
            System.out.println("### crawlNextSection already running - skip");
            return;
        }

        try {
            int idx = nextSection.getAndUpdate(i -> (i + 1) % urls.length);
            crawlOneSection(urls[idx]);
        } finally {
            crawling.set(false);
        }
    }

}