import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8081", // 스프링 서버
  headers: { "Content-Type": "application/json" },
});