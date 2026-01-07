// src/page/loginpage/Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

import CenterAlert from "../../components/common/alarm/CenterAlert";

type LoginResponse = {
  accessToken: string;
  role: "admin" | "user"; // 어드민 / 일반 유저
};

type SuccessState = {
  open: boolean;
  nextPath: string;
  message: string;
};

type ErrorState = {
  open: boolean;
  message: string;
};


export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");


  // 로그인 성공 모달 상태
  const [successAlert, setSuccessAlert] = useState<SuccessState>({
    open: false,
    nextPath: "/",
    message: "",
  });

  // 로그인 실패 모달 상태
  const [errorAlert, setErrorAlert] = useState<ErrorState>({
    open: false,
    message: "",
  });

  const navigate = useNavigate();


  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // 타입은 any로 잡아서 구조확인 가능
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


      // 토큰 + 역할 저장
      localStorage.setItem("accessToken", accessToken);
      const normalizedRole = role.toLowerCase() === "admin" ? "admin" : "user";
      localStorage.setItem("userRole", normalizedRole);

      // 성공 모달 띄우기
      setSuccessAlert({
        open: true,
        nextPath: normalizedRole === "admin" ? "/admin" : "/",
        message:
          normalizedRole === "admin"
            ? "관리자 계정으로 로그인되었습니다."
            : "최신 뉴스를 확인해 보세요.",
      });
    } catch (err: unknown) {
      let msg =
        "로그인에 실패했습니다. 다시 시도해 주세요. 이메일/비밀번호를 확인해 주세요.";

      if (axios.isAxiosError(err)) {
        msg =
          err.response?.data?.message ??
          "이메일/비밀번호를 확인해 주세요.";
      }
      setErrorAlert({
        open: true,
        message: msg,
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessAlert((prev) => ({ ...prev, open: false }));
    navigate(successAlert.nextPath);
  };

  const handleErrorClose = () => {
    setErrorAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>로그인</h1>

        {/* 이메일/비밀번호 로그인 */}
        <form onSubmit={onSubmit} className={styles.loginForm}>
          <label className={styles.loginLabel}>
            <span>이메일 주소</span>
            <input
              className={styles.loginInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className={styles.loginSubmit}>
            로그인
          </button>
        </form>

        <div className={styles.loginFooter}>
          <span className={styles.loginFooterText}>계정이 없으신가요?</span>
          <Link to="/signup" className={styles.loginSignupLink}>
            회원가입
          </Link>
        </div>
      </div>

      {/* 성공 / 실패 모달 – 공통 컴포넌트 사용 */}
      <CenterAlert
        open={successAlert.open}
        message={successAlert.message}
        variant="success"
        onClose={handleSuccessClose}
      />
      <CenterAlert
        open={errorAlert.open}
        message={errorAlert.message}
        variant="error"
        onClose={handleErrorClose}
      />
    </div>
  );
}
