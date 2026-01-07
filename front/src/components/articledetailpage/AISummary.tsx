// src/components/articledetailpage/AISummary.tsx
import "./AISummary.css";

export type AISummaryProps = {
  data: {
    summaryText: string;
    score: number | null;
    createdAt: string;
  };
};

type ParsedScore = {
  label: string;
  value: number;
  max: number;
  rate: number; // 0 ~ 100 (퍼센트)
};

/**
 * summaryText 에서
 * 1) 요약(3줄)
 * 2) 핵심 포인트(1줄)
 * 3) 이하 평가/점수
 * 를 분리해서 반환
 */
function parseSummaryText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const idx1 = lines.findIndex((l) => l.startsWith("1)"));
  const idx2 = lines.findIndex((l) => l.startsWith("2)"));
  const idx3 = lines.findIndex((l) => l.startsWith("3)"));

  // 1) 이후 ~ 2) 이전을 요약으로 사용
  let summaryLines: string[] = [];
  if (idx1 !== -1) {
    const end = idx2 !== -1 ? idx2 : idx3 !== -1 ? idx3 : lines.length;
    summaryLines = lines
      .slice(idx1 + 1, end)
      .map((l) => l.replace(/^-+\s*/, "")); // "- " 제거
  }

  // 2) 이후 ~ 3) 이전 한 줄을 핵심 포인트로 사용
  let keyPointLine = "";
  if (idx2 !== -1) {
    const end = idx3 !== -1 ? idx3 : lines.length;
    const after2 = lines.slice(idx2 + 1, end);
    keyPointLine = after2[0] ?? "";
  }

  // 평가 등급 텍스트(점수용)
  let evaluationText = "";
  const idxEval = lines.findIndex((l) => l.includes("평가 등급"));
  if (idxEval !== -1) {
    evaluationText = lines.slice(idxEval).join(" ");
  }

  return { summaryLines, keyPointLine, evaluationText };
}

/**
 * "라벨: 37/40점" 패턴을 막대그래프용으로 파싱
 */
function parseScores(evaluationText: string): ParsedScore[] {
  const scores: ParsedScore[] = [];
  if (!evaluationText) return scores;

  const regex =
    /([가-힣A-Za-z·\s\[\]A-Z]+?):\s*(\d+)\s*\/\s*(\d+)점/g;

  let m: RegExpExecArray | null;
  while ((m = regex.exec(evaluationText)) !== null) {
    const label = m[1].trim();
    const value = Number(m[2]);
    const max = Number(m[3]);
    if (!max) continue;
    const rate = Math.min(100, Math.round((value / max) * 100));
    scores.push({ label, value, max, rate });
  }

  return scores;
}

export default function AISummary({ data }: AISummaryProps) {
  const { summaryText, score, createdAt } = data;

  const { summaryLines, keyPointLine, evaluationText } =
    parseSummaryText(summaryText);
  const parsedScores = parseScores(evaluationText);

  return (
    <section className="ai-summary-card">
      {/* 디버그용 표시 - 이 문구가 보이면 새 AISummary 컴포넌트가 렌더링 중인 것 */}
      <div style={{ color: "yellow", marginBottom: 4 }}>
        ★ 새 AISummary 컴포넌트
      </div>

      {/* 상단 헤더 */}
      <div className="ai-card-header">
        <div className="ai-card-title">AI 요약</div>
        {score != null && (
          <div className="ai-score-circle">
            <span className="ai-score-main">{score}</span>
            <span className="ai-score-sub">/ 100</span>
          </div>
        )}
      </div>

      {/* 요약 / 핵심 포인트 */}
      <div className="ai-summary-body">
        <div className="ai-summary-block">
          <div className="ai-section-label">요약</div>
          <ul className="ai-summary-list">
            {summaryLines.length > 0 ? (
              summaryLines.map((line, idx) => <li key={idx}>{line}</li>)
            ) : (
              <li>요약 문장을 분석 중입니다.</li>
            )}
          </ul>
        </div>

        <div className="ai-summary-block">
          <div className="ai-section-label">핵심 포인트</div>
          <p className="ai-key-point">
            {keyPointLine || "핵심 포인트를 분석 중입니다."}
          </p>
        </div>
      </div>

      {/* 점수 막대 그래프 */}
      {parsedScores.length > 0 && (
        <div className="ai-score-detail">
          <div className="ai-score-title">AI 평가 세부 점수</div>
          <div className="ai-score-bars">
            {parsedScores.map((s) => (
              <div className="ai-score-row" key={s.label}>
                <div className="ai-score-label">{s.label}</div>
                <div className="ai-score-bar-track">
                  <div
                    className="ai-score-bar-fill"
                    style={{ width: `${s.rate}%` }}
                  />
                </div>
                <div className="ai-score-value">
                  {s.value}/{s.max}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-card-footer">
        생성 시각: {new Date(createdAt).toLocaleString()}
      </div>
    </section>
  );
}
