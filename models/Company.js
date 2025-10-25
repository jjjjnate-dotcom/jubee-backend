import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // 예: 전기, 소방, 조경 등
  contact: { type: String },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Company", companySchema);
