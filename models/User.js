import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  apt_name: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // 승인 상태
  createdAt: { type: Date, default: Date.now },
});

// 비밀번호 암호화
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
