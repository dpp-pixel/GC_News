// src/components/common/alarm/CenterAlert.tsx
import styles from "./CenterAlert.module.css";

export type AlertVariant = "success" | "error" | "logout";

export type CenterAlertProps = {
  open: boolean;
  message: string;
  /** 
   * success: 로그인 성공
   * logout:  로그아웃 성공
   * error:   로그인 실패
   */
  variant?: AlertVariant;
  onClose?: () => void;
};

export default function CenterAlert({
  open,
  message,
  variant = "success",
  onClose,
}: CenterAlertProps) {
  if (!open) return null;

  const isError = variant === "error";
  const isLogout = variant === "logout";

  // 제목
  const title = isError
    ? "로그인 실패"
    : isLogout
    ? "로그아웃 완료"
    : "로그인 완료";

  // 상단 줄 클래스 (성공/로그아웃=검은 줄, 실패=빨간 줄)
  const topBarClass = `${styles.topBar} ${
    isError ? styles.topBarError : styles.topBarSuccess
  }`;

  // 아이콘 (성공/로그아웃=초록 체크, 실패=빨간 X)
  const iconCircleClass = `${styles.iconCircle} ${
    isError ? styles.iconCircleError : styles.iconCircleSuccess
  }`;
  const iconChar = isError ? "✕" : "✓";

  const handleClickBackdrop = () => {
    if (onClose) onClose();
  };

  const handleClickBox: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={handleClickBackdrop}>
      <div className={styles.box} onClick={handleClickBox}>
        {/* 🔹 카드보다 살짝 짧은 상단 줄 */}
        <div className={topBarClass} />

        {/* 아이콘 */}
        <div className={styles.iconWrapper}>
          <div className={iconCircleClass}>{iconChar}</div>
        </div>

        {/* 제목 / 메시지 */}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        {/* 확인 버튼 */}
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
