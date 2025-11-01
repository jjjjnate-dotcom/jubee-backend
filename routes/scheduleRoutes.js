import express from "express";
import Schedule from "../models/Schedule.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ 토큰 검증 미들웨어
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰이 없습니다." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    req.user = decoded;
    next();
  });
}

// ✅ 일정 저장
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, memo } = req.body;
    if (!date || !memo) return res.status(400).json({ message: "날짜와 메모는 필수입니다." });

    const schedule = new Schedule({
      userId: req.user.id,
      date,
      memo,
    });
    await schedule.save();
    res.json({ message: "✅ 일정이 저장되었습니다.", schedule });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 일정 불러오기
router.get("/", verifyToken, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;
