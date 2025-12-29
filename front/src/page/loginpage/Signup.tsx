import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Signup.module.css";

export default function Signup() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:8081/api/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );

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
    <div className={styles.signupPage}>
      <div className={styles.signupCard}>
        <h1 className={styles.signupTitle}>회원가입</h1>

        <form onSubmit={onSubmit} className={styles.signupForm}>
          <label className={styles.signupLabel}>
            <span>이름</span>
            <input
              className={styles.signupInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              required
            />
          </label>

          <label className={styles.signupLabel}>
            <span>이메일</span>
            <input
              className={styles.signupInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              type="email"
              required
            />
          </label>

          <label className={styles.signupLabel}>
            <span>비밀번호</span>
            <input
              className={styles.signupInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password (8자 이상)"
              type="password"
              required
            />
          </label>

          <button type="submit" className={styles.signupSubmit}>
            가입
          </button>
        </form>

        <div className={styles.signupFooter}>
          <Link to="/login" className={styles.signupLoginLink}>
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
