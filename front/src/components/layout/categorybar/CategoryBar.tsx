import styles from "./CategoryBar.module.css";

export default function CategoryBar() {
  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li>정치</li>
          <li>경제</li>
          <li>사회</li>
          <li>생활/문화</li>
          <li>IT/과학</li>
          <li>세계</li>
        </ul>
      </nav>

      <div className={styles.divider}></div>
    </>
  );
}
