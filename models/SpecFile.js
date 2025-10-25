import mongoose from "mongoose";

const SpecFileSchema = new mongoose.Schema({
  projectName: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SpecFile", SpecFileSchema);
