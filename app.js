// ✅ [백엔드] app.js – Express 서버 기본 구성
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // DB 연결
import userRoutes from "./routes/userRoutes.js"; // 일반 회원 API
import adminRoutes from "./routes/adminRoutes.js"; // 관리자 API

// ✅ 환경 변수 로드
dotenv.config();

// ✅ Express 앱 초기화
const app = express();

// ✅ CORS 설정 (여기부터 추가)
const allowedOrigins = [
  "https://jubi-manager.netlify.app", // ✅ 실제 Netlify 프론트 주소
  "http://localhost:5500",            // ✅ 로컬 테스트용
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
app.use(express.static("public")); // 정적 파일 서비스

// ✅ MongoDB 연결 실행
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
