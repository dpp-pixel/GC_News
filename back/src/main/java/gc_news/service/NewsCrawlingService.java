package gc_news.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class NewsCrawlingService {

    public void crawlSection() {
        try {
            String url = "https://news.naver.com/section/100"; // 정치

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

                // 언론사 (여러 패턴 지원)
                String press = article.select(".sa_text_press").text();
                if (press.isEmpty()) press = article.select(".sa_text_info_press").text();
                if (press.isEmpty()) press = article.select(".press").text();

               String time = article.select(".sa_text_date").text();
if (time.isEmpty()) time = article.select(".sa_text_info_time").text();
if (time.isEmpty()) time = article.select(".sa_text_info_date").text();
if (time.isEmpty()) time = article.select(".sa_time").text();
if (time.isEmpty()) time = article.select(".date").text();
if (time.isEmpty()) time = article.select(".info_group span").first() != null ?
        article.select(".info_group span").first().text() : "";

                // 이미지 (src 또는 data-src)
                String imgUrl = article.select("img").attr("src");
                if (imgUrl == null || imgUrl.isEmpty()) {
                    imgUrl = article.select("img").attr("data-src");
                }
                if (imgUrl == null || imgUrl.isEmpty()) {
                    imgUrl = "이미지 없음";
                }

                // 출력
                System.out.println("제목: " + title);
                System.out.println("링크: " + link);
                System.out.println("언론사: " + press);
                System.out.println("시간: " + time);
                System.out.println("이미지: " + imgUrl);
                System.out.println("------------------------------------");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
