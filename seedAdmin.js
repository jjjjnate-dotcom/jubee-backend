// ✅ 관리자 계정 자동 생성 스크립트 (seedAdmin.js)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

await connectDB();

try {
  // 관리자 비밀번호
  const password = "147852";
  const passwordHash = await bcrypt.hash(password, 10);

  // 관리자 데이터
  const adminData = {
    name: "관리자",
    email: "jjjnate@jubee.com",
    passwordHash,
    phone: "010-0000-0000",
    role: "admin",
    status: "approved",
  };

  // 중복 방지 (기존 관리자 있으면 업데이트)
  let admin = await User.findOne({ email: adminData.email });
  if (admin) {
    console.log("⚙️ 기존 관리자 계정 업데이트 중...");
    await User.updateOne({ email: adminData.email }, adminData);
  } else {
    admin = new User(adminData);
    await admin.save();
    console.log("🎉 관리자 계정 생성 완료!");
  }

  console.log(`📧 이메일: ${adminData.email}`);
  console.log(`🔑 비밀번호: ${password}`);
} catch (err) {
  console.error("❌ 관리자 생성 중 오류:", err);
} finally {
  mongoose.connection.close();
  console.log("🔌 MongoDB 연결 종료");
}
