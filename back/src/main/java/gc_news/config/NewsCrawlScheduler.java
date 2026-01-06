package gc_news.config;

import gc_news.service.NewsCrawlingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NewsCrawlScheduler {

    private final NewsCrawlingService newsCrawlingService;

    // 3분마다 한 섹션씩
    @Scheduled(cron = "0 */10 * * * ?")
    public void crawlOneSectionEvery2Min() {
        newsCrawlingService.crawlNextSection();
    }

     // 59분마다 헤드라인 전체 갱신 (test)
    @Scheduled(cron = "0 0/59 * * * ?")
    public void crawlHeadlinesEvery30Min() {
        newsCrawlingService.crawlHeadlineSections();
    }

    // 매일 12시에 칼럼 전체 크롤링
    @Scheduled(cron = "0 0 12 * * ?")
    public void crawlOpinionColumnsDaily() {
        newsCrawlingService.crawlOpinionColumns();
    }
}