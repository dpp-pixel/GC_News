// src/page/loginpage/Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // ✅ 타입은 any로 잡아서 구조확인 가능
      const res = await axios.post<any>(
        "http://localhost:8081/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data); // 실제 데이터 확인

      // accessToken 없으면 실패 처리
      if (!res.data.accessToken) {
        alert(res.data.message ?? "로그인 실패");
        return;
      }

      const { accessToken, role } = res.data;

      // 로컬스토리지 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", role.toLowerCase());

      alert("로그인 성공!");
      navigate("/"); // 성공 시 메인 페이지 이동
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "로그인 실패");
      } else {
        alert("로그인 실패");
      }
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>로그인</h1>

        {/* 소셜 로그인 영역 (UI만) */}
        <section className={styles.loginSection}>
          <p className={styles.loginSectionCaption}>
            SNS 계정으로 간편 로그인
          </p>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.socialBtnNaver}`}
          >
            네이버
          </button>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.socialBtnKakao}`}
          >
            카카오톡
          </button>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.socialBtnGoogle}`}
          >
            Google
          </button>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.socialBtnApple}`}
          >
            Apple로 로그인
          </button>
        </section>

        {/* 이메일/비밀번호 로그인 */}
        <section
          className={`${styles.loginSection} ${styles.loginSectionForm}`}
        >
          <p className={styles.loginSectionCaption}>
            이메일 혹은 아이디로 로그인
          </p>

          <form onSubmit={onSubmit} className={styles.loginForm}>
            <label className={styles.loginLabel}>
              <span>이메일 주소 또는 아이디</span>
              <input
                className={styles.loginInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="username"
                required
              />
            </label>

            <label className={styles.loginLabel}>
              <span>비밀번호</span>
              <input
                className={styles.loginInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            <button type="submit" className={styles.loginSubmit}>
              로그인
            </button>
          </form>
        </section>

        {/* 회원가입 링크 */}
        <div className={styles.loginFooter}>
          <Link to="/signup" className={styles.loginSignupLink}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
