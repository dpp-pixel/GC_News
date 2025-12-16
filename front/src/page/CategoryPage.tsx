import HotIssueSection from "../components/categorypage/HotIssueSection";
import CategoryArticleList from "../components/categorypage/CategoryArticleList";

export default function CategoryPage({ themeId }: { themeId: number }) {
  return (
    <main style={{ width: "1100px", margin: "0 auto" }}>
      <HotIssueSection themeId={themeId} />

      {/*AI 요약 (자리만) */}
      <section style={{
        margin: "40px 0",
        padding: "20px",
        background: "#f5f5f5"
      }}>
        <h2>AI 요약</h2>
        <p>자리만</p>
      </section>

      <CategoryArticleList themeId={themeId} />
    </main>
  );
}
