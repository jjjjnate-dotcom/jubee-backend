import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  userId: {               // ✅ 로그인한 사용자 (토큰에서 가져옴)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {                 // 업체명
    type: String,
    required: true,
  },
  phone: {                // 연락처
    type: String,
    required: true,
  },
  manager: {              // 담당자
    type: String,
    required: true,
  },
  start: {                // 계약 시작일
    type: String,
    required: true,
  },
  end: {                  // 계약 종료일
    type: String,
    required: true,
  },
  alertBefore: {          // 알림 개월 수
    type: Number,
    default: 0,
  },
}, { timestamps: true }); // 등록일/수정일 자동 기록

export default mongoose.model("Company", companySchema);
