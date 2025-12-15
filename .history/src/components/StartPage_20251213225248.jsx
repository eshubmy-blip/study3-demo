// src/components/StartPage.jsx
export default function StartPage({ onStart }) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "32px 24px",
          textAlign: "center",
          overflowY: "auto",
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        <h2 style={{ marginBottom: 24, fontSize: "28px", fontWeight: "700" }}>Study 3 行为实验</h2>
        
        <div
          style={{
            marginBottom: 32,
            textAlign: "left",
            lineHeight: 1.8,
            color: "#333",
          }}
        >
          <div style={{ marginBottom: 20, fontSize: "16px" }}>
            <p style={{ marginBottom: 12, fontWeight: "500" }}>
              欢迎参加本次研究！本研究旨在了解不同文化背景的 AI 主播与产品文化属性匹配对消费者产生的影响。整个实验流程包括：观看一段简短的视频、根据您的真实感受进行选择操作（如"红心"或"加入购物车"）、并填写一份简短问卷。
            </p>
            <p style={{ marginBottom: 12 }}>
              请放心，本研究仅用于学术目的，所有回答均匿名处理，不会收集任何可识别个人身份的信息。实验不存在任何风险，您可在任何时候选择退出。为了保证研究结果的准确性，请务必根据第一直觉作答，并保持自然状态，无需特别思考。感谢您的参与与支持！
            </p>
          </div>
          
          <div style={{ 
            marginTop: 24, 
            paddingTop: 20, 
            borderTop: "1px solid #e0e0e0",
            fontSize: "15px",
            color: "#555"
          }}>
            <p style={{ marginBottom: 12, fontWeight: "500" }}>
              Welcome to this study! This study aims to understand the impact of the matching of AI live-streamers from different cultural backgrounds with the cultural attributes of products on consumers. The entire experimental process includes: watching a short video, making a selection operation based on your real feelings (such as "red Heart" or "Add to Cart"), and filling out a short questionnaire.
            </p>
            <p style={{ marginBottom: 0 }}>
              Please rest assured that this research is only for academic purposes. All responses will be anonymized and no personally identifiable information will be collected. There is no risk in the experiment. You can choose to withdraw at any time. To ensure the accuracy of the research results, please answer based on your first intuition and remain in a natural state without the need for special thinking. Thank you for your participation and support!
            </p>
          </div>
        </div>

        <p style={{ 
          marginBottom: 24, 
          lineHeight: 1.6, 
          fontSize: "16px",
          color: "#666"
        }}>
          点击开始后将播放一段短视频（约 20–25 秒），播放结束后自动进入问卷。
          <br />
          请确保网络通畅，并开启声音（如需要）。
        </p>
  
        <button
          onClick={onStart}
          style={{
            fontSize: 18,
            padding: "14px 36px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            backgroundColor: "#667eea",
            color: "#ffffff",
            fontWeight: "600",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
          }}
        >
          开始实验
        </button>
      </div>
    );
  }
  