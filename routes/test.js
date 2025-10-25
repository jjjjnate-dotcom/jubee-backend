import express from "express";
const router = express.Router();

// ✅ DB 연결 테스트용 라우트
router.get("/test", (req, res) => {
  res.json({ message: "✅ MongoDB 연결 성공! 🎉" });
});

export default router;
