import { useParams } from "react-router-dom";
import HotIssueSection from "../components/categorypage/HotIssueSection";
import CategoryArticleList from "../components/categorypage/CategoryArticleList";
import AdminSummaryCard from "./admin/AdminSummaryCard";

// 테마 ID -> 테마명 매핑
const THEME_NAMES: Record<number, string> = {
  100: "정치",
  101: "경제",
  102: "사회",
  103: "생활/문화",
  104: "세계",
  105: "IT/과학",
};

export default function CategoryPage() {
  const { themeId } = useParams();

  if (!themeId) return null;

  const numericThemeId = Number(themeId);

  if (Number.isNaN(numericThemeId)) return null;

  // 테마명 가져오기
  const themeName = THEME_NAMES[numericThemeId] || "뉴스";

  return (
    <main style={{ width: "1100px", margin: "0 auto" }}>
      <HotIssueSection themeId={numericThemeId} />

      {/* AI 요약 */}
      <section
        style={{
          width: 1100,
          margin: "0px auto 48px",
        }}
      >
        <AdminSummaryCard badge={themeName} themeId={numericThemeId} />
      </section>

      <CategoryArticleList themeId={numericThemeId} />
    </main>
  );
}
