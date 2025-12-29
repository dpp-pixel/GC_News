import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

type LoginResponse = {
  accessToken: string;
};

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  // ⚠ 소셜 로그인은 아직 미구현: 디자인만, 기능 없음
  // 나중에 연동할 때 여기 핸들러 추가
  // const handleSocialLogin = (provider: "naver" | "kakao" | "google" | "apple") => { ... };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post<LoginResponse>(
        "http://localhost:8081/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, // 세션/쿠키 기반이면 유지
        }
      );

      const token = res.data.accessToken;

      // ✅ 토큰 로컬스토리지에 직접 저장
      localStorage.setItem("accessToken", token);

      alert("로그인 성공!");
      navigate("/"); // window.location.href 대신 라우터 사용
    } catch (err: unknown) {
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

        {/* 이메일/비밀번호 로그인 (실제 동작) */}
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
