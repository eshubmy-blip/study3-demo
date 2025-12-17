// src/components/StartPage.jsx
import Bilingual from './Bilingual'
import { TEXT } from '../i18n/text'

export default function StartPage({ onStart }) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          // 底部多留出空间，避免被移动端浏览器工具栏遮挡
          padding: "32px 24px 120px 24px",
          textAlign: "center",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          color: "#333",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <h2 style={{ marginBottom: 24, fontSize: "28px", fontWeight: "700" }}>
          <Bilingual
            en={TEXT.start.title.en}
            zh={TEXT.start.title.zh}
            align="center"
          />
        </h2>
        
        <div
          style={{
            marginBottom: 32,
            textAlign: "left",
            lineHeight: 1.8,
            color: "#333",
          }}
        >
          <div style={{ marginBottom: 20, fontSize: "16px" }}>
            <Bilingual
              en={TEXT.start.intro1.en}
              zh={TEXT.start.intro1.zh}
              style={{ marginBottom: 12, fontWeight: "500" }}
            />
            <Bilingual
              en={TEXT.start.intro2.en}
              zh={TEXT.start.intro2.zh}
            />
          </div>
        </div>

        <div style={{ 
          marginBottom: 24, 
          lineHeight: 1.6, 
          fontSize: "16px",
          color: "#666",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ fontSize: "15px", color: "#666" }}>
            <Bilingual
              en={TEXT.start.flow1.en}
              zh={TEXT.start.flow1.zh}
            />
          </div>
          <div style={{ fontSize: "16px", color: "#666" }}>
            <Bilingual
              en={TEXT.start.flow2.en}
              zh={TEXT.start.flow2.zh}
            />
          </div>
        </div>
  
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
            fontWeight: "700",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.5)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
            // 与问卷提交按钮保持一致的底部空白
            marginBottom: "80px",
            minHeight: "56px",
            minWidth: "260px",
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
          <Bilingual
            en={TEXT.start.button.en}
            zh={TEXT.start.button.zh}
            align="center"
          />
        </button>
      </div>
    );
  }
  