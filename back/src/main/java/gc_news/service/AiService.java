package gc_news.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Service;
import org.jsoup.Jsoup;

import gc_news.entity.Article;
import gc_news.entity.Summary;
import gc_news.repository.ArticleRepository;
import gc_news.repository.SummaryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class AiService {

        private final OpenAiChatModel chatModel;
        private final ArticleRepository articleRepository;
        private final SummaryRepository summaryRepository;

        // ✅ 1) "점수: 82점" 같은 문장에서 숫자만 뽑아내는 정규식 패턴
        private static final Pattern SCORE_PATTERN = Pattern.compile("점수:\\s*(\\d+)점");

        // ✅ 2) Summary 전체 텍스트에서 점수만 추출하는 헬퍼 메서드
        private Integer extractScore(String text) {
                if (text == null)
                        return null;

                Matcher m = SCORE_PATTERN.matcher(text);
                if (m.find()) {
                        try {
                                return Integer.parseInt(m.group(1)); // "82" -> 82
                        } catch (NumberFormatException ignored) {
                        }
                }
                return null; // 점수 못 찾으면 null
        }

        // 시스템 프롬프트 + 유저 프롬프트 형태 (조금 더 통제하고 싶을 때)
        public String askWithSystem(String systemPrompt, String userPrompt) {
                var system = new SystemMessage(systemPrompt);
                var user = new UserMessage(userPrompt);

                var prompt = new Prompt(
                                List.of(system, user),
                                OpenAiChatOptions.builder()
                                                .model(OpenAiApi.ChatModel.GPT_4_O)
                                                .temperature(0.3)
                                                .build());

                ChatResponse response = chatModel.call(prompt);
                return response.getResult().getOutput().getText();
        }

        // 기사 요약용 헬퍼 예시
        public String summarizeArticle(String articleText) {
                String userPrompt = "기사를 요약하고 평가해줘.\n\n[기사 본문]\n" + articleText;

                var prompt = new Prompt(
                                List.of(
                                                new SystemMessage(
                                                                "당신은 뉴스 기사 품질 평가 전문가입니다. 다음 기준에 따라 기사를 평가해주세요. "
                                                                                + "### ⚠️ 평가 원칙 1. 우수한 저널리즘 기준으로 평가 (평범한 기사 = 평범한 점수) 2. 각 항목 최고점은 완벽한 경우에만 부여 3. 문제점 발견 시 즉시 감점 "
                                                                                + "### 평가 배점 (총 100점) - 내용 중심 평가 "
                                                                                + "#### Part A. 제목-본문 정합성 (40점) "
                                                                                + "- **키워드 일치도 (10점)** • 제목의 모든 키워드가 본문에 명확히 등장: 10점 • 대부분 일치하나 일부 불명확: 7점 • 절반 정도 일치: 5점 • 일치도 낮음: 3점 "
                                                                                + "- **주제 반영도 (10점)** • 본문 핵심이 제목에 정확히 요약됨: 10점 • 주요 내용 반영되나 부차적 내용 강조: 7점 • 부분적으로만 반영: 5점 • 제목과 본문 초점 불일치: 3점 "
                                                                                + "- **과장/왜곡 여부 (20점)** ← 강화 • 사실 그대로 전달, 완전 중립적: 20점 • 약간의 강조 표현: 16점 • 경미한 과장 (범위→단일값 등): 12점 • 선정적/모호한 표현: 8점 • 명백한 오도/클릭베이트: 0-4점 "
                                                                                + "#### Part B. 내용 구성 품질 (60점) "
                                                                                + "- **사실/의견 구분 명확성 (35점)** ← 강화 ※ 사실: 검증 가능한 객관적 정보 ※ 의견: 주장, 추측, 감정 표현 "
                                                                                + "• 사실 60% 이상 + 출처 명확: 35점 • 사실 45-59% + 출처 대부분 명확: 28점 • 사실 30-44% 또는 출처 일부 불명확: 20점 • 사실 30% 미만 또는 사실/의견 혼재: 12점 • 대부분 의견이나 추측: 5점 "
                                                                                + "- **내용 균형성 (25점)** ※ 5개 요소: 사실/수치/주장/배경/분석 "
                                                                                + "• 5개 요소 모두 충실히 포함: 25점 • 4개 요소 포함: 20점 • 3개 요소 포함: 15점 • 2개 요소: 10점 • 1개 이하: 5점 "
                                                                                + "### 세부 분석 항목 "
                                                                                + "1. 사실 (Facts): 공식 발표, 실명 인용, 검증 가능한 데이터 "
                                                                                + "2. 수치 (Numbers): 출처가 명확한 구체적 숫자 "
                                                                                + "3. 주장 (Claims): 의견, 추측, 익명 인용, 감정 표현 "
                                                                                + "4. 배경설명 (Context): 과거 경위, 관련 정보 "
                                                                                + "5. 분석 (Analysis): 전문가 실명 견해, 근거 있는 인과관계 "
                                                                                + "### 점수 해석 가이드 "
                                                                                + "- 75점 이상: 우수한 기사 - 60-74점: 평균적 기사 - 45-59점: 미흡한 기사 - 45점 미만: 저품질 기사 "
                                                                                + "### 출력 형식(반드시 준수): "
                                                                                + "1) 요약(3줄):\r\n"
                                                                                + "- ...\r\n"
                                                                                + "- ...\r\n"
                                                                                + "- ...\r\n"

                                                                                + "\r\n"
                                                                                + "2) 핵심 포인트(1줄):\r\n"
                                                                                + "- ...\r\n"

                                                                                + "\r\n"
                                                                                + "3) ━━━━━━━━━━━━━━━━━━━━━━━━\r\n"
                                                                                + " 평가 등급: [등급]\n [Part A] 제목-본문 정합성: __/40점 "
                                                                                + "- 키워드 일치도: __/10점 - 주제 반영도: __/10점 - 과장/왜곡: __/20점\n"
                                                                                + "[Part B] 내용 구성 품질: __/60점 - 사실/의견 구분: __/35점 - 내용 균형성: __/25점 "
                                                                                + " 내용 구성 비율: - 사실: __% - 수치: __% - 주장/의견: __% - 배경: __% - 분석: __% "
                                                                                + " \n 점수: __점"),
                                                new UserMessage(userPrompt)),
                                OpenAiChatOptions.builder()
                                                .model(OpenAiApi.ChatModel.GPT_4_O)
                                                .temperature(0.2)
                                                .build());

                ChatResponse response = chatModel.call(prompt);
                return response.getResult().getOutput().getText();
        }

        // =========================
        // 3) 여기 추가: articleId 기반으로 DB에서 가져와 Summary 저장/재사용 (B안)
        // =========================
        public Summary summarizeArticleFromDbAndSave(Long articleId, boolean force) {

                // 1) 캐시 조회
                Summary cached = summaryRepository
                                .findTopByTargetTypeAndTargetIdOrderByCreatedAtDesc(
                                                Summary.TargetType.article,
                                                articleId)
                                .orElse(null);

                if (!force && cached != null) {
                        return cached;
                }

                // 2) 기사 조회
                Article article = articleRepository.findById(articleId)
                                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + articleId));

                // 3) 본문 텍스트 얻기 (content 기준)
                String rawContent = article.getContent();

                if (rawContent == null || rawContent.isBlank()) {
                        throw new IllegalStateException("Article content is empty: " + articleId);
                }

                // HTML일 수도 있으니 한 번 정리해주기 (태그 제거)
                String cleanedContent = Jsoup.parse(rawContent).text();

                // 4) 제목 + 본문 합치기
                String input = """
                                [제목]
                                %s

                                [본문]
                                %s
                                """.formatted(article.getTitle(), cleanedContent);

                // 5) 실제 요약/평가 호출
                String resultText = summarizeArticle(input);

                Integer score = extractScore(resultText);

                // 6) Summary 저장
                Summary summary = Summary.builder()
                                .targetType(Summary.TargetType.article)
                                .targetId(articleId)
                                .summaryText(resultText)
                                .score(score)
                                .createdAt(LocalDateTime.now())
                                .article(article)
                                .theme(article.getTheme())
                                .build();

                return summaryRepository.save(summary);
        }
}