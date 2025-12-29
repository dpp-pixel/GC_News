// src/components/layout/Header/Header.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

import searchIcon from "/src/assets/icons/search.svg";
import userIcon from "/src/assets/icons/user4.svg";

export default function Header() {
  // 로그인 상태: localStorage의 토큰을 기준으로
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("accessToken");
  });

  // 드롭다운 / 검색창 열림 상태
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 바깥 클릭용 ref
  const userAreaRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // 라우터 이동 / 현재 경로
  const navigate = useNavigate();
  const location = useLocation();

  // 라우트가 바뀔 때마다 토큰 다시 확인해서 isLoggedIn 동기화
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // 바깥 클릭 시 메뉴/검색창 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // 유저 드롭다운
      if (
        isUserOpen &&
        userAreaRef.current &&
        !userAreaRef.current.contains(target)
      ) {
        setIsUserOpen(false);
      }

      // 검색창 (아이콘 + 인풋을 감싼 wrapper 기준)
      if (
        isSearchOpen &&
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserOpen, isSearchOpen]);

  const handleUserIconClick = () => {
    setIsUserOpen((prev) => !prev);
  };

  // ===================== 내 정보 기능들 =====================

  const handleMyContents = () => {
    navigate("/my-contents");
    setIsUserOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsUserOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setIsUserOpen(false);
    navigate("/");
  };

  const handleGoLoginPage = () => {
    navigate("/login");
  };
  // =======================================================

  return (
    <header className={styles.header}>
      {/* 로고: 클릭하면 항상 홈(/) */}
      <h1 className={styles.title}>
        <Link to="/">Insight News</Link>
      </h1>

      {/* 오른쪽 아이콘들 */}
      <div className={styles.icons}>
        {/* 검색 아이콘 + 검색창 래퍼 */}
        <div ref={searchWrapperRef} className={styles.searchWrapper}>
          {/* 검색창: 검색 아이콘 바로 왼쪽에 애니메이션으로 펼쳐짐 */}
          <div
            className={`${styles.searchDrawer} ${
              isSearchOpen ? styles.searchOpen : ""
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

          {/* 검색 아이콘 */}
          <button
            type="button"
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchOpen((prev) => !prev);
            }}
          >
            <img
              src={searchIcon}
              alt="검색"
              className={`${styles.icon} ${styles.searchIcon}`}
            />
          </button>
        </div>

        {/* 유저 아이콘 + 드롭다운 */}
        <div ref={userAreaRef} className={styles.userWrapper}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              handleUserIconClick();
            }}
          >
            <img
              src={userIcon}
              alt="유저"
              className={`${styles.icon} ${styles.userIcon}`}
            />
            {isLoggedIn && (
              <span className={styles.checkBadge}>✓</span>
            )}
          </button>

          {/* 유저 드롭다운 */}
          <div
            className={`${styles.dropdown} ${
              isUserOpen ? styles.open : ""
            }`}
          >
            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  className={styles.userMenuItem}
                  onClick={handleGoLoginPage}
                >
                  로그인
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.userMenuItem}
                  onClick={handleMyContents}
                >
                  내 콘텐츠
                </button>
                <button
                  type="button"
                  className={styles.userMenuItem}
                  onClick={handleProfile}
                >
                  회원정보
                </button>
                <button
                  type="button"
                  className={styles.userMenuItem}
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
