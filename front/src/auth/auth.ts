// src/auth/auth.ts
//로그인 확인 함수
const ACCESS_TOKEN_KEY = "accessToken";

export const saveToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const isLoggedIn = () => {
  return !!getToken();
};