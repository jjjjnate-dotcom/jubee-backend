// models/Schedule.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // 일정 날짜
  date: { type: String, required: true },  // ex) "2025-11-01"

  // 일정 제목 (달력에 표시할 제목)
  title: { type: String, required: true }, // ex) "🏢 ○○업체 계약 만료"

  // 메모나 설명 (선택)
  description: { type: String },

  // 일정 구분 (company_end, company_alert 등)
  type: { type: String },

  // 어떤 데이터(업체 등)에서 만들어졌는지
  relatedType: { type: String }, // ex) "company"
  relatedId: { type: mongoose.Schema.Types.ObjectId },

}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);
