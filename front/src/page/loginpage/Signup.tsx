import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Signup.module.css";

import CenterAlert from "../../components/common/alarm/CenterAlert";

type SuccessState = {
  open: boolean;
  nextPath: string;
  message: string;
};

type ErrorState = {
  open: boolean;
  message: string;
};

export default function Signup() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean>(false);

  // 회원가입 성공 모달 상태
  const [successAlert, setSuccessAlert] = useState<SuccessState>({
    open: false,
    nextPath: "/login",
    message: "",
  });

  // 회원가입 실패 모달 상태
  const [errorAlert, setErrorAlert] = useState<ErrorState>({
    open: false,
    message: "",
  });

  const navigate = useNavigate();

  // 이메일 중복확인 함수
  const checkEmailDuplicate = async () => {
    if (!email) {
      setErrorAlert({
        open: true,
        message: "이메일을 입력해 주세요.",
      });
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8081/api/auth/check-email?email=${encodeURIComponent(email)}`,
        { withCredentials: true }
      );

      if (res.data.available) {
        setIsEmailChecked(true);
        setIsEmailAvailable(true);
        setSuccessAlert({
          open: true,
          nextPath: "",
          message: "사용 가능한 이메일입니다.",
        });
      } else {
        setIsEmailChecked(true);
        setIsEmailAvailable(false);
        setErrorAlert({
          open: true,
          message: "이미 사용 중인 이메일입니다.",
        });
      }
    } catch (err: unknown) {
      setErrorAlert({
        open: true,
        message: "이메일 중복 확인에 실패했습니다.",
      });
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 이메일 중복확인 체크
    if (!isEmailChecked || !isEmailAvailable) {
      setErrorAlert({
        open: true,
        message: "이메일 중복확인을 해주세요.",
      });
      return;
    }

    // 비밀번호 길이 체크
    if (password.length < 8) {
      setErrorAlert({
        open: true,
        message: "비밀번호는 8자 이상이어야 합니다.",
      });
      return;
    }

    try {
      await axios.post(
        "http://localhost:8081/api/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );

      // 성공 모달 띄우기
      setSuccessAlert({
        open: true,
        nextPath: "/login",
        message: "회원가입이 완료되었습니다! 이제 로그인하세요.",
      });
    } catch (err: unknown) {
      let msg = "회원가입에 실패했습니다. 다시 시도해 주세요.";

      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? "회원가입 실패";
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
    <div className={styles.signupPage}>
      <div className={styles.signupCard}>
        <button
          className={styles.closeButton}
          onClick={() => navigate("/")}
          aria-label="메인으로 돌아가기"
        >
          ✕
        </button>
        <h1 className={styles.signupTitle}>회원가입</h1>

        <form onSubmit={onSubmit} className={styles.signupForm}>
          <label className={styles.signupLabel}>
            <span>이름</span>
            <input
              className={styles.signupInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </label>

          <label className={styles.signupLabel}>
            <span>이메일 주소</span>
            <div className={styles.emailInputWrapper}>
              <input
                className={styles.signupInput}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailChecked(false);
                  setIsEmailAvailable(false);
                }}
                placeholder="이메일을 입력하세요"
                type="email"
                required
              />
              <button
                type="button"
                className={styles.checkEmailButton}
                onClick={checkEmailDuplicate}
              >
                중복확인
              </button>
            </div>
            {isEmailChecked && (
              <span
                className={
                  isEmailAvailable
                    ? styles.emailCheckSuccess
                    : styles.emailCheckError
                }
              >
                {isEmailAvailable
                  ? "✓ 사용 가능한 이메일입니다."
                  : "✗ 이미 사용 중인 이메일입니다."}
              </span>
            )}
          </label>

          <label className={styles.signupLabel}>
            <span>비밀번호</span>
            <input
              className={styles.signupInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (8자 이상)"
              type="password"
              minLength={8}
              required
            />
          </label>

          <button type="submit" className={styles.signupSubmit}>
            회원가입
          </button>
        </form>

        <div className={styles.signupFooter}>
          <span className={styles.signupFooterText}>이미 계정이 있으신가요?</span>
          <Link to="/login" className={styles.signupLoginLink}>
            로그인
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
