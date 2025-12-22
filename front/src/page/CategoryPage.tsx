import { useParams } from "react-router-dom";
import HotIssueSection from "../components/categorypage/HotIssueSection";
import CategoryArticleList from "../components/categorypage/CategoryArticleList";

export default function CategoryPage() {
  const { themeId } = useParams();

  if (!themeId) return null; // ⭐ 핵심

  const numericThemeId = Number(themeId);

  if (Number.isNaN(numericThemeId)) return null; // ⭐ 안전장치

  return (
    <main style={{ width: "1100px", margin: "0 auto" }}>
      <HotIssueSection themeId={numericThemeId} />

      {/* AI 요약 */}
      <section
        style={{
          margin: "40px 0",
          padding: "20px",
          background: "#f5f5f5",
        }}
      >
        <h2>AI 요약</h2>
        <p>자리만</p>
      </section>

      <CategoryArticleList themeId={numericThemeId} />
    </main>
  );
}
