package gc_news.service;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import gc_news.entity.Article;
import gc_news.entity.Reporter;
import gc_news.repository.ReporterRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ReporterRepository reporterRepository;

    /**
     * 기사 상세 HTML에서 기자를 찾아 Article에 연결
     */
    public void attachReporterFromArticlePage(Document document, Article article) {

        // 네이버 기사 상세에서 기자 링크 or 기자 이름 영역
        Element reporterElement = document.selectFirst("a[href*=/journalist/]");

        if (reporterElement == null) {
            // 기자 없는 기사 (속보, 연합뉴스 일부 등)
            return;
        }

        String journalistUrl = reporterElement.attr("href");
        // 여기서 ID 추출
        String externalJournalistId = extractJournalistId(journalistUrl);

        if (externalJournalistId == null) {
            return; // 이상한 URL이면 그냥 기자 연결 안 함
        }

        String reporterName = reporterElement.text().trim();
        String press = article.getPress(); // 기사에 이미 있음

        Reporter reporter = reporterRepository
                .findByExternalJournalistId(externalJournalistId)
                .orElseGet(() -> reporterRepository.save(
                        Reporter.builder()
                                .externalJournalistId(externalJournalistId)
                                .name(reporterName)
                                .press(press)
                                .build()));

        article.setReporter(reporter);
    }

    private String extractJournalistId(String journalistUrl) {
        // 예: https://media.naver.com/journalist/655/81986
        if (journalistUrl == null || journalistUrl.isBlank()) {
            return null;
        }
        String[] parts = journalistUrl.split("/");
        return parts[parts.length - 1]; // "81986"
    }
}