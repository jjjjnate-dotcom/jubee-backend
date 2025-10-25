import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// ✅ 업로드 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ 단일 파일 업로드
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    filePath: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
  });
});

export default router;
