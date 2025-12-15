// src/components/StartPage.jsx
export default function StartPage({ onStart }) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Study 3 行为实验</h2>
        <p style={{ marginBottom: 24, lineHeight: 1.6 }}>
          点击开始后将播放一段短视频（约 20–25 秒），播放结束后自动进入问卷。
          <br />
          请确保网络通畅，并开启声音（如需要）。
        </p>
  
        <button
          onClick={onStart}
          style={{
            fontSize: 18,
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          开始实验
        </button>
      </div>
    );
  }
  