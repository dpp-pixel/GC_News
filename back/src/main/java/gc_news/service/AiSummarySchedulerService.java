package gc_news.service;

import gc_news.entity.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiSummarySchedulerService {

    private final ArticleService articleService;
    private final AiService aiService;

    /**
     * 모든 헤드라인 요약 갱신 (메인 + 각 테마)
     */
    public void updateAllHeadlineSummaries() {
        try {
            // 1) 메인 헤드라인 요약 갱신
            updateMainHeadlineSummary();

            // 2) 각 테마별 헤드라인 요약 갱신
            updateThemeHeadlineSummaries();

        } catch (Exception e) {
            System.err.println("[AI 요약 스케줄러] 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 메인 페이지 헤드라인 요약 갱신
     */
    private void updateMainHeadlineSummary() {
        try {
            System.out.println("[AI 요약 갱신] 메인 헤드라인 요약 시작");
            List<Article> headlines = articleService.getHeadlineArticles(6);

            if (!headlines.isEmpty()) {
                aiService.summarizeHeadlineNews(headlines, true); // force=true로 강제 갱신
                System.out.println("[AI 요약 갱신] 메인 헤드라인 요약 완료");
            } else {
                System.out.println("[AI 요약 갱신] 메인 헤드라인 뉴스 없음");
            }
        } catch (Exception e) {
            System.err.println("[AI 요약 갱신] 메인 헤드라인 실패: " + e.getMessage());
        }
    }

    /**
     * 테마별 헤드라인 요약 갱신
     */
    private void updateThemeHeadlineSummaries() {
        // 테마 ID 목록 (정치, 경제, 사회, 생활/문화, 세계, IT/과학)
        Long[] themeIds = {100L, 101L, 102L, 103L, 104L, 105L};

        for (Long themeId : themeIds) {
            try {
                System.out.println("[AI 요약 갱신] 테마 " + themeId + " 요약 시작");
                List<Article> headlines = articleService.getHeadlineArticlesByTheme(themeId, 6);

                if (!headlines.isEmpty()) {
                    aiService.summarizeThemeHeadlineNews(themeId, headlines, true); // force=true로 강제 갱신
                    System.out.println("[AI 요약 갱신] 테마 " + themeId + " 요약 완료");
                } else {
                    System.out.println("[AI 요약 갱신] 테마 " + themeId + " 헤드라인 뉴스 없음");
                }
            } catch (Exception e) {
                System.err.println("[AI 요약 갱신] 테마 " + themeId + " 실패: " + e.getMessage());
                // 한 테마 실패해도 다른 테마는 계속 진행
            }
        }
    }
}
