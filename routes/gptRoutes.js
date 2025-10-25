import express from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ GPT 문서 생성
router.post("/generate", async (req, res) => {
  try {
    const { projectName, spec } = req.body;

    const prompt = `
    공사명: ${projectName}
    공사내용: ${spec}
    ---
    위 내용을 기반으로 아파트 특기시방서를 작성하시오.
    형식은 명확하고 실제 현장 적용 가능한 시방서 형태로 작성하세요.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "너는 전문 건설 시방서 작성 전문가야." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const result = response.choices[0].message.content;
    const outputDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filePath = path.join(outputDir, `${projectName}.txt`);
    fs.writeFileSync(filePath, result, "utf8");

    res.json({ success: true, file: `/uploads/${projectName}.txt`, message: "시방서 생성 완료" });
  } catch (err) {
    console.error("❌ GPT 생성 오류:", err);
    res.status(500).json({ message: "GPT 문서 생성 실패" });
  }
});

export default router;
