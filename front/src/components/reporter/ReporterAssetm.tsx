import { Link } from "react-router-dom";

interface Reporter {
  reporterId: number;
  name: string;
  profileImageUrl?: string | null;
  press: string;
}

interface ReporterAssetProps {
  reporter?: Reporter | null;
}

export default function ReporterAsset({ reporter }: ReporterAssetProps) {
  if (!reporter) return null;

  return (
    <Link
      to={`/reporter/${reporter.reporterId}`}
      className="reporter-asset"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #eee",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* 프로필 이미지 */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#f3f3f3",
          flexShrink: 0,
        }}
      >
        {reporter.profileImageUrl ? (
          <img
            src={reporter.profileImageUrl}
            alt={`${reporter.name} 기자`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              // 이미지 깨지면 그냥 숨겨버리기
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>

      {/* 이름/언론사 */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 600 }}>{reporter.name} 기자</span>
        <span style={{ fontSize: 12, color: "#666" }}>{reporter.press}</span>
      </div>
    </Link>
  );
}