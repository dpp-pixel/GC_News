import NaverNews from "../components/mainpage/NaverNews";

interface Props {
  category: string;
}

export default function CategoryPage({ category }: Props) {
  return (
    <div style={{ padding: "20px" }}>
      <h2>{category} 뉴스</h2>

      {/* 해당 카테고리 뉴스만 가져오기 */}
      <NaverNews query={category} />
    </div>
  );
}
