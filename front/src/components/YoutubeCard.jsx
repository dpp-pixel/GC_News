function YoutubeCard({ title, videoId }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "8px",
        borderRadius: "6px",
        width: "100%",
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h4 style={{ fontSize: "14px", marginBottom: "6px" }}>{title}</h4>

      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "4px",
          }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default YoutubeCard;
