// src/components/layout/Header/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

import searchIcon from "/src/assets/icons/search.svg";
import userIcon from "/src/assets/icons/user4.svg";

export default function Header() {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* 로고: 클릭하면 항상 홈(/)으로 이동 */}
      <h1 className={styles.title}>
        <Link to="/">Insight News</Link>
      </h1>

      {/* 오른쪽 아이콘 영역 */}
      <div className={styles.icons}>
        {/* 검색 아이콘 */}
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setIsSearchOpen((prev) => !prev)}
        >
          <img src={searchIcon} alt="검색" className={styles.icon} />
        </button>

        {/* 유저 아이콘 + 드롭다운 */}
        <div className={styles.userWrapper}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setIsUserOpen((prev) => !prev)}
          >
            <img src={userIcon} alt="유저" className={styles.icon} />
          </button>

          {/* 유저 드롭다운 메뉴 */}
          <div
            className={`${styles.dropdown} ${
              isUserOpen ? styles.open : ""
            }`}
          >
            <button type="button">내 콘텐츠</button>
            <button type="button">회원정보</button>
            <button type="button">로그아웃</button>
          </div>
        </div>
      </div>

      {/* 검색 드롭다운: 헤더 아래 회색 박스 */}
      <div
        className={`${styles.searchDrawer} ${
          isSearchOpen ? styles.open : ""
        }`}
      >
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className={styles.searchInput}
        />
        <button type="button" className={styles.searchSubmit}>
          검색
        </button>
      </div>
    </header>
  );
}
