import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },      // ex) "2025-11-01"
  memo: { type: String, required: true },      // 메모 내용
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);
