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
    @Scheduled(cron = "0 */3 * * * ?")
    public void crawlOneSectionEvery2Min() {
        newsCrawlingService.crawlNextSection();
    }
}