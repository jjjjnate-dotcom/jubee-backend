import express from "express";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

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

// ✅ 업체 등록
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, phone, manager, start, end, alertBefore } = req.body;

    if (!name || !phone || !manager || !start || !end) {
      return res.status(400).json({ message: "모든 항목을 입력해야 합니다." });
    }

    const company = new Company({
      userId: req.user.id,
      name,
      phone,
      manager,
      start,
      end,
      alertBefore: alertBefore || 0,
    });

    await company.save();
    res.json({ message: "✅ 업체가 등록되었습니다.", company });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 업체 목록 조회
router.get("/", verifyToken, async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 업체 삭제
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!company) return res.status(404).json({ message: "업체를 찾을 수 없습니다." });
    res.json({ message: "🗑️ 업체가 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;
