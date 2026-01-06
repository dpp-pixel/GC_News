package gc_news.config;

import gc_news.service.NewsCrawlingService;
import gc_news.service.AiSummarySchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NewsCrawlScheduler {

    private final NewsCrawlingService newsCrawlingService;
    private final AiSummarySchedulerService aiSummarySchedulerService;

    // 10분마다 한 섹션씩
    @Scheduled(cron = "0 */10 * * * ?")
    public void crawlOneSectionEvery2Min() {
        newsCrawlingService.crawlNextSection();
    }

     // 59분마다 헤드라인 전체 갱신 (test)
    @Scheduled(cron = "0 0/59 * * * ?")
    public void crawlHeadlinesEvery30Min() {
        System.out.println("[스케줄러] 헤드라인 크롤링 시작");
        newsCrawlingService.crawlHeadlineSections();
        System.out.println("[스케줄러] 헤드라인 크롤링 완료 - AI 요약 갱신 시작");

        // 헤드라인 크롤링 후 AI 요약 자동 갱신
        aiSummarySchedulerService.updateAllHeadlineSummaries();
        System.out.println("[스케줄러] AI 요약 갱신 완료");
    }

    // 매 시간 12시에 칼럼 전체 크롤링
    @Scheduled(cron = "0 0 * * * ?")
    public void crawlOpinionColumnsDaily() {
        newsCrawlingService.crawlOpinionColumns();
    }
}