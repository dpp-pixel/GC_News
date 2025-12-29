// src/auth/apiClient.ts
import axios from "axios";
import { getToken } from "./auth";  // ✅ 키 말고 함수 재사용

const apiClient = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true, // 세션/쿠키도 같이 보냄
});

// 요청 나가기 전에 토큰 붙이기
apiClient.interceptors.request.use((config) => {
  const token = getToken(); // ✅ auth.ts와 동일한 방식으로 토큰 읽기

  if (token) {
    // headers가 없으면 객체 하나 만들어주고,
    // Axios v1 타입 문제는 any 캐스팅으로 우회
    if (!config.headers) {
      config.headers = {} as any;
    }
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
