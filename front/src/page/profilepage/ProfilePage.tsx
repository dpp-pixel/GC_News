// src/page/ProfilePage.tsx
import "./ProfilePage.css";

export default function ProfilePage() {
  return (
    <div className="profile-page">
      <h2 className="page-title">회원정보</h2>
      <div className="divider" />

      {/* ===== 필수정보 ===== */}
      <section className="profile-section">
        <h3 className="section-title">필수정보</h3>

        <div className="info-row">
          <span className="label">닉네임</span>
          <span className="value">살찐만두3</span>
          <button className="action">수정</button>
        </div>

        <div className="info-row">
          <span className="label">가입일시</span>
          <span className="value">2025년 12월 21일</span>
        </div>

        <div className="info-row">
          <span className="label">대표 이메일</span>
          <span className="value">legoskt@gmail.com</span>
          <button className="action">수정</button>
        </div>

        <p className="sub-text">
          설정하신 대표 이메일로 안내 메일, 뉴스레터 등을 보내드립니다.
        </p>
      </section>

      {/* ===== SNS로 로그인 ===== */}
      <section className="profile-section">
        <h3 className="section-title">SNS로 로그인</h3>

        <div className="info-row">
          <span className="label with-icon">
            <span className="social-icon naver">N</span>
            네이버 로그인
          </span>
          <button className="action primary">연동</button>
        </div>

        <div className="info-row">
          <span className="label with-icon">
            <span className="social-icon kakao">●</span>
            카카오 로그인
          </span>
          <button className="action primary">연동</button>
        </div>

        <div className="info-row">
          <span className="label with-icon">
            <span className="social-icon google">G</span>
            legoskt@gmail.com
          </span>
          <button className="action danger">해제</button>
        </div>

        <div className="info-row">
          <span className="label with-icon">
            <span className="social-icon apple"></span>
            애플 로그인
          </span>
          <button className="action primary">연동</button>
        </div>
      </section>

      {/* ===== 이메일로 로그인 ===== */}
      <section className="profile-section">
        <h3 className="section-title">이메일로 로그인</h3>

        <div className="info-row">
          <span className="label">이메일</span>
          <button className="action primary">인증</button>
        </div>
      </section>

      {/* ===== 선택정보 ===== */}
      <section className="profile-section">
        <h3 className="section-title">선택정보</h3>

        <div className="info-row">
          <span className="label">본인인증여부</span>
          <span className="value muted">인증되지 않았습니다.</span>
          <button className="action primary">인증</button>
        </div>

        <div className="info-row">
          <span className="label">마케팅 정보 수신 동의</span>
          <span className="value muted">동의하지 않았습니다.</span>
          <button className="action primary">동의</button>
        </div>

        <div className="info-row link-row">
          <span className="label">뉴스레터 수신 관리</span>
          <span className="arrow">&gt;</span>
        </div>
      </section>

      {/* ===== 회원탈퇴 ===== */}
      <div className="withdraw-wrapper">
        <button className="withdraw-button">회원탈퇴</button>
      </div>
    </div>
  );
}
