import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState<string>("");        // 이름 상태 추가
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // name까지 같이 전송
      await api.post("/api/auth/signup", { name, email, password });

      alert("회원가입 완료! 이제 로그인하세요.");
      navigate("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "회원가입 실패");
      } else {
        alert("회원가입 실패");
      }
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>회원가입</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        {/* 이름 입력 추가 */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password (8자 이상)"
          type="password"
        />
        <button type="submit">가입</button>
      </form>
    </div>
  );
}