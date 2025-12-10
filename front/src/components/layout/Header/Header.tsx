import styles from "./Header.module.css";
import searchIcon from "/src/assets/icons/search.svg";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Insight News</h1>

      <div className={styles.icons}>
        <img src={searchIcon} alt="검색" className={styles.icon} />
      </div>
    </header>
  );
}
