import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ 라우트 불러오기
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import gptRoutes from "./routes/gptRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ 공통 미들웨어
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 정적 파일 (HTML 및 업로드)
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 라우트 등록
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/gpt", gptRoutes);
app.use("/api/files", fileRoutes);

// ✅ 기본 루트 확인용
app.get("/", (req, res) => {
  res.send("🚀 JUBEE Backend Server is Running on Render!");
});

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 완료"))
  .catch(err => console.error("❌ MongoDB 연결 실패:", err));

// ✅ 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Render 서버 실행 중 (포트: ${PORT})`));
