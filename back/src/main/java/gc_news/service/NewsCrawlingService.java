package gc_news.service;

import gc_news.entity.Article;
import gc_news.entity.ArticleMedia;
import gc_news.entity.Theme;
import gc_news.repository.ArticleMediaRepository;
import gc_news.repository.ArticleRepository;
import gc_news.repository.ThemeRepository;

import java.time.LocalDateTime;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class NewsCrawlingService {

    private final ArticleRepository articleRepository;
    private final ThemeRepository themeRepository;
    private final ArticleMediaRepository articleMediaRepository;

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
        for (String url : urls) {
            crawlOneSection(url);
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
     * URL 기반으로 theme 자동 할당
     */
    private Long getThemeIdFromUrl(String url) {
        if (url.contains("/100"))
            return 1L;
        if (url.contains("/101"))
            return 2L;
        if (url.contains("/102"))
            return 3L;
        if (url.contains("/103"))
            return 4L;
        if (url.contains("/104"))
            return 5L;
        if (url.contains("/105"))
            return 6L;
        return 1L;
    }
}