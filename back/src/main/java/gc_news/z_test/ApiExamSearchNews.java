package gc_news.z_test;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.text.StringEscapeUtils;

public class ApiExamSearchNews {
/* 
    public static void main(String[] args) {

        String clientId = "EpWWkQ2d0jxw6KT8qumS"; 
        String clientSecret = "naDlhHtOBP";

          String text;
        try {
            text = URLEncoder.encode("속보", "UTF-8"); // 검색어
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("검색어 인코딩 실패", e);
        }

        String apiURL = "https://openapi.naver.com/v1/search/news.json?query=" 
                        + text + "&display=10&sort=date";

        Map<String, String> requestHeaders = new HashMap<>();
        requestHeaders.put("X-Naver-Client-Id", clientId);
        requestHeaders.put("X-Naver-Client-Secret", clientSecret);

        String responseBody = get(apiURL, requestHeaders);

        System.out.println("=== 네이버 뉴스 검색 결과 ===\n");
        System.out.println(responseBody);
    }

    private static String get(String apiUrl, Map<String, String> requestHeaders) {
        HttpURLConnection con = connect(apiUrl);
        try {
            con.setRequestMethod("GET");
            for (Map.Entry<String, String> header : requestHeaders.entrySet()) {
                con.setRequestProperty(header.getKey(), header.getValue());
            }

            int responseCode = con.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                return readBody(con.getInputStream());
            } else {
                return readBody(con.getErrorStream());
            }
        } catch (IOException e) {
            throw new RuntimeException("API 요청/응답 실패", e);
        } finally {
            con.disconnect();
        }
    }

    private static HttpURLConnection connect(String apiUrl) {
        try {
            URL url = new URL(apiUrl);
            return (HttpURLConnection) url.openConnection();
        } catch (MalformedURLException e) {
            throw new RuntimeException("잘못된 URL: " + apiUrl, e);
        } catch (IOException e) {
            throw new RuntimeException("연결 실패: " + apiUrl, e);
        }
    }

    private static String readBody(InputStream body) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(body, "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            // ★ 핵심: JSON 디코딩 (HTML + Unicode escape → 한글)
            return decode(sb.toString());

        } catch (IOException e) {
            throw new RuntimeException("API 응답 읽기 실패", e);
        }
    }

    // HTML 엔티티 + \uAC00 유니코드 → 한글로 변환
    private static String decode(String text) {
        if (text == null) return null;

        try {
            // 1) &lt;b&gt; &quot; &#1234; 등 HTML 엔티티 제거
            String unescapedHtml = StringEscapeUtils.unescapeHtml4(text);

            // 2) \uAC00 같은 유니코드 escape 해제
            return new ObjectMapper().readValue("\"" + unescapedHtml + "\"", String.class);

        } catch (Exception e) {
            return text;
        }
    }
        */
}