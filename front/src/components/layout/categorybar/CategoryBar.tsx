// src/components/layout/categorybar/CategoryBar.tsx
import { Link } from "react-router-dom";
import styles from "./CategoryBar.module.css";

export default function CategoryBar() {
  const categories = [
    { name: "정치", id: 100 },
    { name: "경제", id: 101 },
    { name: "사회", id: 102 },
    { name: "생활/문화", id: 103 },
    { name: "세계", id: 104 },
    { name: "IT/과학", id: 105 },
  ];

  return (
    <div className={styles["category-bar"]}>
      <nav className={styles.nav}>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link to={`/category/${cat.id}`}>{cat.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.divider} />
    </div>
  );
}
