// routes/scheduleRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import Schedule from "../models/Schedule.js";

const router = express.Router();

// ✅ 토큰 검사
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰이 없습니다." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    req.user = decoded;
    next();
  });
}

// ✅ 일정 목록 (모든 일정 조회)
router.get("/", verifyToken, async (req, res) => {
  try {
    const list = await Schedule.find({ userId: req.user.id }).sort({ date: 1, createdAt: -1 });
    res.json(list); // 프론트에서 relatedType 보고 업체 일정은 따로 표시 가능
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 일정 저장 (메모 전용)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, memo, title, description, relatedType, relatedId, type } = req.body;

    if (!date) {
      return res.status(400).json({ message: "날짜는 필수입니다." });
    }

    // ✅ 업체 일정은 여기서 차단
  if (relatedType === "company" || relatedType === "vendor") {
  console.log("🚫 업체 일정은 schedules DB에 저장하지 않습니다.");
  return res.status(200).json({ message: "업체 일정은 company 컬렉션에만 저장됩니다." });
}


    // ⚙️ 메모만 있을 경우 title = memo
    const finalTitle = title || memo;
    if (!finalTitle) {
      return res.status(400).json({ message: "일정 제목이 없습니다." });
    }

    // ✅ 일반 일정만 DB 저장
    const schedule = await Schedule.create({
      userId: req.user.id,
      date,
      title: finalTitle,
      description: description || "",
      relatedType: relatedType || null,
      relatedId: relatedId || null,
      type: type || null,
    });

    res.json(schedule);
  } catch (err) {
    console.error("❌ 일정 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 일정 삭제
router.post("/delete", verifyToken, async (req, res) => {
  try {
    const { date, memo } = req.body;

    const result = await Schedule.findOneAndDelete({
      userId: req.user.id,
      date,
      $or: [{ title: memo }, { description: memo }],
    });

    if (!result) {
      return res.status(404).json({ message: "일정을 찾을 수 없습니다." });
    }

    res.json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("❌ 일정 삭제 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;
