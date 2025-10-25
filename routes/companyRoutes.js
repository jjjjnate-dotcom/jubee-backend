import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

// 업체 목록 조회
router.get("/", async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// 업체 등록
router.post("/", async (req, res) => {
  const company = new Company(req.body);
  await company.save();
  res.json({ message: "✅ 업체 등록 완료", company });
});

export default router;
