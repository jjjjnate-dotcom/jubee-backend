// ✅ 최상단: 환경변수 가장 먼저 로드
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ✅ Express 앱 초기화
const app = express();

// ✅ 환경변수 로드 확인 로그 (Render에서 디버깅용)
console.log("✅ JWT_SECRET =", process.env.JWT_SECRET ? "Loaded" : "❌ Missing");
console.log("✅ MONGO_URI =", process.env.MONGO_URI ? "Loaded" : "❌ Missing");

// ✅ CORS 설정
const allowedOrigins = [
  "https://jubi-manager.netlify.app",
  "http://localhost:5500",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ 공통 미들웨어
app.use(express.json());
app.use(express.static("public"));

// ✅ MongoDB 연결 실행
connectDB();

// ✅ 라우트 등록
app.use("/api/users", userRoutes);     // ← 일반 회원 라우트
app.use("/api/admin", adminRoutes);    // ← 관리자 라우트

// ✅ 테스트 라우트
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
