// ✅ [백엔드] MongoDB 연결 설정 파일
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB 연결 성공");
  } catch (error) {
    console.error("❌ MongoDB 연결 실패:", error.message);
    process.exit(1); // 연결 실패 시 서버 종료
  }
};

export default connectDB;

