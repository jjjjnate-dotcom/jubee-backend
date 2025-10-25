import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Calendar", calendarSchema);
