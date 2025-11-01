// ✅ [백엔드] 관리자 전용 라우트 (adminRoutes.js)
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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "이메일과 비밀번호를 입력하세요." });
    }

    // ✅ email로 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "존재하지 않는 계정입니다." });
    }

    // ✅ 관리자 권한 확인
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "관리자 계정이 아닙니다." });
    }

    // ✅ 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "비밀번호가 올바르지 않습니다." });
    }

    // ✅ JWT 발급
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      message: "관리자 로그인 성공",
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ 관리자 로그인 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 👥 전체 회원 목록 조회 (승인·미승인 포함)
 * GET /api/admin/users
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ 회원 목록 조회 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * ✅ 회원 승인 처리
 * PATCH /api/admin/users/:id/approve
 */
router.patch("/users/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { approved: true, status: "approved" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ success: true, message: `${user.name}님이 승인되었습니다.`, user });
  } catch (error) {
    console.error("❌ 회원 승인 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 🔄 승인 상태 토글 (승인 ↔ 대기중)
 * PATCH /api/admin/users/:id/toggle
 */
router.patch("/users/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    // 🔁 승인 상태 반전
    user.approved = !user.approved;
    user.status = user.approved ? "approved" : "pending";
    await user.save();

    res.json({
      success: true,
      message: user.approved ? `${user.name}님 승인됨` : `${user.name}님 승인 취소됨`,
      user,
    });
  } catch (error) {
    console.error("❌ 승인 토글 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

/**
 * ❌ 회원 삭제
 * DELETE /api/admin/users/:id
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ success: true, message: `${deleted.name}님이 삭제되었습니다.` });
  } catch (error) {
    console.error("❌ 회원 삭제 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});
console.log("✅ adminRoutes loaded (/api/admin/users/:id/toggle included)");
export default router;