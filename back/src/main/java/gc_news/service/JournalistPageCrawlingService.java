package gc_news.service;

import gc_news.dto.JournalistArticleDto;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistPageCrawlingService {

    /**
     * 기자 페이지 URL 기준으로, 기자가 최근 쓴 기사 목록을 크롤링
     *  - DB 저장 안 하고, DTO 리스트로 바로 반환
     *
     * @param journalistUrl 네이버 기자 페이지 URL (예: https://media.naver.com/journalist/629/81478)
     * @param press         언론사 이름(한글, 예: "한국경제", "이데일리")
     */
    public List<JournalistArticleDto> crawlJournalistArticles(String journalistUrl, String press)
            throws IOException {

        Document doc = Jsoup.connect(journalistUrl)
                .userAgent("Mozilla/5.0")
                .timeout(5000)
                .get();

        // 기자 페이지에서 기사 리스트 영역 선택
        // (press_edit_news_list 가 여러 개 있을 수 있어서 다 긁어온 뒤, 그 안의 li를 전부 사용)
        Elements lists = doc.select("ul.press_edit_news_list");
        List<JournalistArticleDto> result = new ArrayList<>();

        for (Element ul : lists) {
            Elements items = ul.select("li.press_edit_news_item_as_thumb");

            for (Element li : items) {

                // 기사 링크
                Element linkEl = li.selectFirst("a");
                if (linkEl == null) continue;

                String articleUrl = linkEl.absUrl("href");
                if (articleUrl == null || articleUrl.isBlank()) continue;

                // 제목 (타이틀 전용 클래스가 있으면 우선 사용, 없으면 a 태그 텍스트)
                String title = li.select(".press_edit_news_title, .press_edit_news_tit").text();
                if (title == null || title.isBlank()) {
                    title = linkEl.text();
                }

                // 썸네일 이미지
                String thumb = li.select("img").attr("src");
                if (thumb == null || thumb.isBlank()) {
                    thumb = li.select("img").attr("data-src");
                }
                if (thumb != null && thumb.isBlank()) {
                    thumb = null;
                }

                JournalistArticleDto dto = JournalistArticleDto.builder()
                        .title(title)
                        .url(articleUrl)
                        .press(press)      // 이미 기사/리포터에서 가지고 있는 한글 언론사 이름
                        .thumbnail(thumb)
                        .build();

                result.add(dto);
            }
        }

        return result;
    }
}