// src/components/layout/Header/Header.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

import searchIcon from "/src/assets/icons/search.svg";
import userIcon from "/src/assets/icons/user4.svg";

// 중앙 알림 모달
import CenterAlert from "../../common/alarm/CenterAlert";

export default function Header() {


  // 로그인 여부: accessToken 존재 여부
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("accessToken");
  });

  // userRole 상태: "admin" | "user" | null
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(() => {
    const role = localStorage.getItem("userRole");
    return role === "admin" || role === "user" ? role : null;
  });

  /** 관리자 여부 플래그 */
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


  // 로그아웃 알림 모달 open 여부
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

  // 바깥 클릭용 ref

  const userAreaRef = useRef<HTMLDivElement | null>(null);
  const searchDrawerRef = useRef<HTMLDivElement | null>(null);
  const searchIconRef = useRef<HTMLButtonElement | null>(null);


  // 라우터 이동 / 현재 경로
  const navigate = useNavigate();
  const location = useLocation();

  // 라우트가 바뀔 때마다 토큰/role 다시 확인해서 동기화
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


      // 검색창 (아이콘 + 드로어)
      const inSearchIcon =
        searchIconRef.current && searchIconRef.current.contains(target);
      const inSearchDrawer =
        searchDrawerRef.current && searchDrawerRef.current.contains(target);

      if (isSearchOpen && !inSearchIcon && !inSearchDrawer) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserOpen, isSearchOpen]);


  const handleUserIconClick = () => {
    setIsUserOpen((prev) => !prev);
  };

  // ===================== 내 정보 관련 이동 함수 =====================

  // 내 콘텐츠로 이동 (일반 회원용)
  const handleMyContents = () => {
    navigate("/my-contents");
    setIsUserOpen(false);
  };

  // 회원정보로 이동 (일반 회원용)
  const handleProfile = () => {
    navigate("/profile");
    setIsUserOpen(false);
  };

  // 관리자 페이지로 이동 (관리자용)
  const handleAdmin = () => {
    navigate("/admin");
    setIsUserOpen(false);
  };

  // 로그아웃

  const handleLogout = () => {
    // 토큰 + role 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    setIsUserOpen(false);

    // 홈으로 이동

    navigate("/");

    // 로그아웃 알림 표시
    setLogoutAlertOpen(true);
  };
  const handleGoLoginPage = () => navigate("/login");


  // 로그아웃 알림 닫기
  const handleCloseLogoutAlert = () => {
    setLogoutAlertOpen(false);
  };

  return (
    <>
      {/* ✅ 로그아웃 알림 모달 */}
      <CenterAlert
        open={logoutAlertOpen}
        message="정상적으로 로그아웃되었습니다."
        variant="logout"        // ← 로그아웃 전용 variant
        onClose={handleCloseLogoutAlert}
      />

      <header className={styles.header}>
        {/* 로고: 클릭하면 항상 홈(/) */}
        <h1 className={styles.title}>
          <Link to="/">Insight News</Link>
        </h1>

        {/* 오른쪽 아이콘 영역 */}
        <div className={styles.icons}>
          {/* 🔍 검색 아이콘 + 검색창 */}
          <div className={styles.searchWrapper}>
            {/* 아이콘 왼쪽에 슬라이드되는 검색창 */}
            <div
              ref={searchDrawerRef}
              className={`${styles.searchDrawer} ${
                isSearchOpen ? styles.searchOpen : ""
              }`}
            >
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className={styles.searchInput}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
              />
              <button
                type="button"
                className={styles.searchSubmit}
                onClick={handleSearchSubmit}
              >
                검색
              </button>
            </div>

            {/* 검색 아이콘 버튼 */}
            <button
              ref={searchIconRef}
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
                className={`${styles.icon} styles.searchIcon`}
              />
            </button>
          </div>

          {/* 👤 유저 아이콘 + 드롭다운 */}
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

            {/* 드롭다운 */}
            <div
              className={`${styles.dropdown} ${
                isUserOpen ? styles.open : ""
              }`}
            >
              {/* 1) 비로그인 상태 */}
              {!isLoggedIn && (
                <button
                  type="button"
                  className={styles.userMenuItem}
                  onClick={handleGoLoginPage}
                >
                  로그인
                </button>
              )}

              {/* 2) 로그인 + 관리자 계정 */}
              {isLoggedIn && isAdmin && (
                <>
                  <button
                    type="button"
                    className={styles.userMenuItem}
                    onClick={handleAdmin}
                  >
                    관리자 모드
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

              {/* 3) 로그인 + 일반 회원 계정 */}
              {isLoggedIn && !isAdmin && (
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
    </>
  );
}
