// ✅ seedAdmin.js - 최초 관리자 계정 1회 생성용
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB 연결 성공");

    // 관리자 비밀번호
    const password = "147852";
    const passwordHash = await bcrypt.hash(password, 10);

    // 관리자 데이터
    const adminData = {
      name: "관리자",
      email: "jjjnate@jubee.com",
      passwordHash,
      phone: "010-0000-0000",
      apt_name: "주비시스템",
      role: "admin",
      status: "approved",
    };

    // 중복 방지
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️ 이미 관리자 계정이 존재합니다.");
      return;
    }

    const admin = new User(adminData);
    await admin.save();

    console.log("🎉 관리자 계정 생성 완료!");
    console.log("📧 이메일:", adminData.email);
    console.log("🔑 비밀번호:", password);
  } catch (error) {
    console.error("❌ 관리자 생성 오류:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB 연결 종료");
  }
};

createAdmin();
