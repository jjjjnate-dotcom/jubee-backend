// ✅ [백엔드] 일반 회원 라우터 (회원가입 / 로그인)
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ 회원가입 (POST /api/users/signup)
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password, agree } = req.body;

    // 필수값 검증
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "필수 입력 항목을 모두 입력하세요." });
    }

    // 이메일 중복 검사
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "이미 가입된 이메일입니다." });
    }

    // 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 새 회원 생성
    const newUser = new User({
      name,
      phone,
      email,
      passwordHash,
      agree: agree || "동의",
      role: "user",
      status: "pending", // 관리자 승인 전까지 로그인 불가
    });

    await newUser.save();
    res.json({
      success: true,
      message: "회원 가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
    });
  } catch (error) {
    console.error("❌ 회원가입 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// ✅ 로그인 (POST /api/users/login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일/비번 검증
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "이메일과 비밀번호를 모두 입력하세요." });
    }

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "등록되지 않은 이메일입니다." });
    }

    // 승인 상태 확인
    if (user.status !== "approved") {
      return res.status(403).json({ success: false, message: "관리자 승인 후 이용 가능합니다." });
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "비밀번호가 올바르지 않습니다." });
    }

    // JWT 발급
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      message: "로그인 성공",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ 로그인 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});
import jwt from "jsonwebtoken";

// ✅ 로그인한 사용자 정보 조회 (/api/users/me)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "토큰이 없습니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ /me 오류:", error);
    res.status(401).json({ success: false, message: "유효하지 않은 토큰입니다." });
  }
});

export default router;
