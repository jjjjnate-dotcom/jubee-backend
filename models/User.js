// ✅ [백엔드] User 모델 - 일반회원 + 관리자 공용
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "이름은 필수 입력 항목입니다."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "전화번호는 필수 입력 항목입니다."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "이메일은 필수 입력 항목입니다."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "비밀번호는 필수 입력 항목입니다."],
    },
    agree: {
      type: String,
      default: "동의", // "이벤트 및 공지 알림 동의"
    },

    // ✅ 권한
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // 기본은 일반 회원
    },

    // ✅ 승인 상태 (두 가지 방식 모두 호환)
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending", // 기본은 승인 대기
    },
    approved: {
      type: Boolean,
      default: false, // true면 승인 완료
    },
  },
  { timestamps: true } // createdAt, updatedAt 자동 추가
);

const User = mongoose.model("User", userSchema);
export default User;
