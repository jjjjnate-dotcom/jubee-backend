// ✅ [백엔드] 관리자 전용 라우트
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔐 관리자 로그인
 * POST /api/admin/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "이메일과 비밀번호를 입력하세요." });

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(403).json({ success: false, message: "관리자 계정이 아닙니다." });

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "비밀번호가 올바르지 않습니다." });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      message: "관리자 로그인 성공",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("❌ 관리자 로그인 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 🧾 미승인 회원 목록 조회
 * GET /api/admin/pending-users
 */
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: "user", status: "pending" })
      .select("name phone email createdAt");
    res.json({ success: true, users: pendingUsers });
  } catch (error) {
    console.error("❌ 미승인 회원 조회 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * ✅ 회원 승인 처리
 * POST /api/admin/approve
 */
router.post("/approve", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ success: false, message: "userId가 누락되었습니다." });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });

    user.status = "approved";
    await user.save();

    res.json({ success: true, message: `${user.name}님의 계정이 승인되었습니다.` });
  } catch (error) {
    console.error("❌ 회원 승인 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});
/**
 * ❌ 회원 삭제
 * DELETE /api/admin/delete/:id
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    res.json({ success: true, message: `${deleted.name}님이 삭제되었습니다.` });
  } catch (error) {
    console.error("❌ 회원 삭제 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

export default router;
