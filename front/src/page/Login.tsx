import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import { saveToken } from "../auth/auth";

type LoginResponse = {
  accessToken: string;
};

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const token = res.data.accessToken;

      saveToken(token);

      alert("로그인 성공!");
      window.location.href = "/";  // 나중에 useNavigate로 바꿔도 됨
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "로그인 실패");
      } else {
        alert("로그인 실패");
      }
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>로그인</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        <button type="submit">로그인</button>
      </form>

      {/* 회원가입 링크 추가 */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Link to="/signup"> 회원가입</Link>
      </div>
    </div>
  );
}