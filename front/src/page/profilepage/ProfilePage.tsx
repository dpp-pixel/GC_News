// src/page/ProfilePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { clearToken } from "@/auth/auth";
import "./ProfilePage.css";

type UserInfo = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 회원탈퇴 모달 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get("/users/me");
        setUserInfo(response.data);
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      alert("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      await api.post("/users/me/change-password", {
        currentPassword,
        newPassword,
      });

      alert("비밀번호가 변경되었습니다.");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const message = error.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      alert(message);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await api.delete("/users/me", {
        data: { password: withdrawPassword },
      });

      alert("회원 탈퇴가 완료되었습니다.");
      clearToken();
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "회원 탈퇴에 실패했습니다.";
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="profile-page">
      <h2 className="page-title">회원정보</h2>
      <div className="divider" />

      {/* ===== 필수정보 ===== */}
      <section className="profile-section">
        <h3 className="section-title">필수정보</h3>

        <div className="info-row">
          <span className="label">이름</span>
          <span className="value">{userInfo.name || "미설정"}</span>
        </div>

        <div className="info-row">
          <span className="label">가입일시</span>
          <span className="value">{formatDate(userInfo.createdAt)}</span>
        </div>

        <div className="info-row">
          <span className="label">이메일</span>
          <span className="value">{userInfo.email}</span>
        </div>

        <div className="info-row">
          <span className="label">회원 등급</span>
          <span className="value">
            {userInfo.role === "admin" ? "관리자" : "일반 회원"}
          </span>
        </div>

        
      </section>

      {/* ===== 비밀번호 변경 ===== */}
      <section className="profile-section">
        <h3 className="section-title">보안</h3>

        <div className="info-row">
          <span className="label">비밀번호</span>
          <span className="value muted">••••••••</span>
          <button
            className="action primary"
            onClick={() => setShowPasswordModal(true)}
          >
            변경
          </button>
        </div>
      </section>

      {/* ===== 회원탈퇴 ===== */}
      <div className="withdraw-wrapper">
        <button
          className="withdraw-button"
          onClick={() => setShowWithdrawModal(true)}
        >
          회원탈퇴
        </button>
      </div>

      {/* ===== 비밀번호 변경 모달 ===== */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">비밀번호 변경</h3>

            <div className="modal-field">
              <label>현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
              />
            </div>

            <div className="modal-field">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력 (8자 이상)"
                minLength={8}
              />
            </div>

            <div className="modal-field">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 다시 입력"
                minLength={8}
              />
            </div>

            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                취소
              </button>
              <button className="modal-button confirm" onClick={handleChangePassword}>
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 회원탈퇴 모달 ===== */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">회원탈퇴</h3>

            <p className="modal-warning">
              탈퇴 후에는 계정을 복구할 수 없습니다.
              <br />
              정말로 탈퇴하시겠습니까?
            </p>

            <div className="modal-field">
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>

            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawPassword("");
                }}
              >
                취소
              </button>
              <button className="modal-button danger" onClick={handleWithdraw}>
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
