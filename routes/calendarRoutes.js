import express from "express";
import Calendar from "../models/Calendar.js";

const router = express.Router();

// 일정 전체 조회
router.get("/", async (req, res) => {
  const events = await Calendar.find();
  res.json(events);
});

// 일정 추가
router.post("/", async (req, res) => {
  const event = new Calendar(req.body);
  await event.save();
  res.json({ message: "✅ 일정 등록 완료", event });
});

export default router;
