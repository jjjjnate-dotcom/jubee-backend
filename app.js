// ✅ [백엔드] app.js – Express 서버 기본 구성
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // DB 연결
import userRoutes from "./routes/userRoutes.js"; // 일반 회원 API
import adminRoutes from "./routes/adminRoutes.js"; // 관리자 API

dotenv.config();
const app = express();

// ✅ 미들웨어 설정
app.use(cors()); // (필요 시 origin 제한 가능)
app.use(express.json()); // JSON 요청 파싱
app.use(express.static("public")); // 정적 파일 서비스

// ✅ DB 연결 실행
connectDB();

// ✅ 라우트 연결
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ✅ 테스트용 기본 라우트
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
