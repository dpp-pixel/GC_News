package gc_news.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;  // ← 이거!
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class NewsCrawlingService {

    public void crawlSection() {
        try {
            String url = "https://news.naver.com/section/100";

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            Elements articles = doc.select(".sa_item");

            for (Element article : articles) {
                String title = article.select(".sa_text_title").text();
                String link = article.select("a").attr("href");

                System.out.println("제목: " + title);
                System.out.println("링크: " + link);
                System.out.println("------");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
