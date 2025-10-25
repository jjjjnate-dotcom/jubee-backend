import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

/* ✅ 회원가입 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, apt_name } = req.body;

    // 첫 가입자는 자동으로 관리자 + 승인
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";
    const status = userCount === 0 ? "approved" : "pending";

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "이미 가입된 이메일입니다." });

    const user = new User({ name, email, password, phone, apt_name, role, status });
    await user.save();

    res.json({
      success: true,
      message:
        userCount === 0
          ? "첫 관리자 계정이 생성되었습니다 ✅"
          : "가입신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입 오류" });
  }
});

/* ✅ 로그인 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "등록되지 않은 이메일입니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });

    if (user.status !== "approved") {
      return res.status(403).json({ message: "관리자 승인 후 로그인 가능합니다." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "로그인 오류" });
  }
});

/* ✅ 로그인된 사용자 정보 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "토큰이 없습니다." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "토큰이 유효하지 않습니다." });
  }
});

/* ✅ 관리자 전용 승인 관련 */
router.get("/pending", authAdmin, async (req, res) => {
  const users = await User.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json(users);
});

router.put("/approve/:id", authAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ success: true, message: "회원 승인 완료" });
});

router.put("/reject/:id", authAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ success: true, message: "회원 거절 완료" });
});

export default router;
