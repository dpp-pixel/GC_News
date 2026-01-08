// src/components/layout/footer/Footer.tsx
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* 상단 영역 */}
        <div className="footer-top">
          <div className="footer-logo">Insight News</div>

          <div className="footer-top-body">
            {/* 왼쪽 : 임시 컨텐츠 + 카테고리 */}
            <div className="footer-left">

              {/*  가운데 세로 구분선 (텍스트 | 대신) */}
              <div className="footer-divider" />

              {/* 카테고리 텍스트 */}
              <div className="footer-left-col footer-left-col-right">
                <div className="footer-row">정치 · 세계</div>
                <div className="footer-row">경제 · IT/과학</div>
                <div className="footer-row">사회</div>
                <div className="footer-row">생활/문화</div>
              </div>
            </div>

            {/* 오른쪽 : 회사 정보 */}
            <div className="footer-right">
              {/* ✅ 솔데스크 바로 왼쪽 세로선 */}
              <div className="footer-divider" />

              <div className="footer-right-col">
                <div className="footer-row">솔데스크</div>
                <div className="footer-row">주소 : 종로12길 15 코아빌딩 2층, 5층, 8층, 9층, 10층</div>
                <div className="footer-row">전화번호 02-2020-0114</div>
                <div className="footer-row">©insightnews</div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 바 */}
        <div className="footer-bottom">
          

          <div className="footer-copy">
            ©insightnews.com All rights reserved. 무단 전재, 재배포 및 AI학습
            이용 금지
          </div>
        </div>
      </div>
    </footer>
  );
}
