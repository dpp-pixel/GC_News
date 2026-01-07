const ACCESS_TOKEN_KEY = "accessToken";
const USER_ROLE_KEY = "userRole"; // 사용자 역할(role) 보관용 key 추가

export type UserRole = "user" | "admin"; // 프론트에서 사용하는 역할 타입 정의 추가 

// 토큰 저장
export const saveToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// 토큰 + 역할을 한 번에 저장하는 헬퍼 (옵션용) 수정 /12.29
export const saveAuthInfo = (token: string, role: UserRole) => {
  saveToken(token);
  saveUserRole(role);
};

// clearToken: 기존에는 accessToken만 지웠는데,
//              이제 userRole도 같이 지우도록 변경
export const clearToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY); // role도 같이 삭제
};

export const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const isLoggedIn = () => {
  return !!getToken();
};

// 역할 저장 추가 
export const saveUserRole = (role: UserRole) => {
  localStorage.setItem(USER_ROLE_KEY, role);
};

// 역할 조회 추가
export const getUserRole = (): UserRole | null => {
  const value = localStorage.getItem(USER_ROLE_KEY);
  if (value === "admin" || value === "user") {
    return value;
  }
  return null;
};

// 관리자 여부 편의 함수 추가
export const isAdmin = () => getUserRole() === "admin";

// 로그인 필요 기능 체크 함수 추가
export const requireLogin = (navigate: (path: string) => void): boolean => {
  if (!isLoggedIn()) {
    alert("로그인이 필요한 기능입니다.");
    navigate("/login");
    return false;
  }
  return true;
};
