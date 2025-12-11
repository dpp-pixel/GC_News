import { Link } from "react-router-dom";
import styles from "./CategoryBar.module.css";

export default function CategoryBar() {
  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/category/정치">정치</Link></li>
          <li><Link to="/category/경제">경제</Link></li>
          <li><Link to="/category/사회">사회</Link></li>
          <li><Link to="/category/생활문화">생활/문화</Link></li>
          <li><Link to="/category/IT과학">IT/과학</Link></li>
          <li><Link to="/category/세계">세계</Link></li>
        </ul>
      </nav>

      <div className={styles.divider}></div>
    </>
  );
}
