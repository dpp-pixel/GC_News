// src/components/layout/Header/Header.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

import searchIcon from "/src/assets/icons/search.svg";
import userIcon from "/src/assets/icons/user4.svg";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("accessToken"));
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(() => {
    const role = localStorage.getItem("userRole");
    return role === "admin" || role === "user" ? role : null;
  });
  const isAdmin = userRole === "admin";

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  
  // 검색 기능 추가
 
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태

  const handleSearchSubmit = () => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) return;

    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setIsSearchOpen(false);
    setSearchKeyword("");
  };

  const userAreaRef = useRef<HTMLDivElement | null>(null);
  const searchDrawerRef = useRef<HTMLDivElement | null>(null);
  const searchIconRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");

    setIsLoggedIn(!!token);
    setUserRole(role === "admin" || role === "user" ? role : null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (isUserOpen && userAreaRef.current && !userAreaRef.current.contains(target)) {
        setIsUserOpen(false);
      }

      const inSearchIcon = searchIconRef.current && searchIconRef.current.contains(target);
      const inSearchDrawer = searchDrawerRef.current && searchDrawerRef.current.contains(target);

      if (isSearchOpen && !inSearchIcon && !inSearchDrawer) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserOpen, isSearchOpen]);

  const handleUserIconClick = () => setIsUserOpen((prev) => !prev);
  const handleMyContents = () => { navigate("/my-contents"); setIsUserOpen(false); };
  const handleProfile = () => { navigate("/profile"); setIsUserOpen(false); };
  const handleAdmin = () => { navigate("/admin"); setIsUserOpen(false); };
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    setIsUserOpen(false);
    navigate("/");
  };
  const handleGoLoginPage = () => navigate("/login");

  return (
    <header className={styles.header}>
      <h1 className={styles.title}><Link to="/">Insight News</Link></h1>

      <div className={styles.icons}>
        {/* 검색창 */}
        <div className={styles.searchWrapper}>
          <div
            ref={searchDrawerRef}
            className={`${styles.searchDrawer} ${isSearchOpen ? styles.searchOpen : ""}`}
          >
            {/* 검색어 상태 + 엔터 이벤트 추가 */}
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
            />
            <button type="button" className={styles.searchSubmit} onClick={handleSearchSubmit}>
              검색
            </button>
          </div>

          <button
            ref={searchIconRef}
            type="button"
            className={styles.iconButton}
            onClick={(e) => { e.stopPropagation(); setIsSearchOpen((prev) => !prev); }}
          >
            <img src={searchIcon} alt="검색" className={`${styles.icon} styles.searchIcon`} />
          </button>
        </div>

        {/* 👤 유저 드롭다운 */}
        <div ref={userAreaRef} className={styles.userWrapper}>
          <button type="button" className={styles.iconButton} onClick={(e) => { e.stopPropagation(); handleUserIconClick(); }}>
            <img src={userIcon} alt="유저" className={`${styles.icon} ${styles.userIcon}`} />
            {isLoggedIn && <span className={styles.checkBadge}>✓</span>}
          </button>

          <div className={`${styles.dropdown} ${isUserOpen ? styles.open : ""}`}>
            {!isLoggedIn && (
              <button type="button" className={styles.userMenuItem} onClick={handleGoLoginPage}>
                로그인
              </button>
            )}
            {isLoggedIn && isAdmin && (
              <>
                <button type="button" className={styles.userMenuItem} onClick={handleAdmin}>관리자 모드</button>
                <button type="button" className={styles.userMenuItem} onClick={handleLogout}>로그아웃</button>
              </>
            )}
            {isLoggedIn && !isAdmin && (
              <>
                <button type="button" className={styles.userMenuItem} onClick={handleMyContents}>내 콘텐츠</button>
                <button type="button" className={styles.userMenuItem} onClick={handleProfile}>회원정보</button>
                <button type="button" className={styles.userMenuItem} onClick={handleLogout}>로그아웃</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
