// src/page/ProfilePage.tsx

export default function ProfilePage() {
  return (
    <div style={{ maxWidth: 960, margin: "80px auto 40px", padding: "0 16px" }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>회원정보</h2>
      <p style={{ marginBottom: 8 }}>여기는 회원 정보 페이지입니다.</p>
      <p style={{ color: "#666" }}>
        (임시 화면) 추후에는 닉네임, 이메일, 구독 설정, 비밀번호 변경 등을
        이 페이지에 배치하면 된다.
      </p>
    </div>
  );
}
