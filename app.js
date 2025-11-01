// ✅ 최상단: 환경변수 가장 먼저 로드
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import fetch from "node-fetch";  // ✅ GPT 호출용 추가

// ✅ Express 앱 초기화
const app = express();

// ✅ 환경변수 로드 확인 로그 (Render에서 디버깅용)
console.log("✅ JWT_SECRET =", process.env.JWT_SECRET ? "Loaded" : "❌ Missing");
console.log("✅ MONGO_URI =", process.env.MONGO_URI ? "Loaded" : "❌ Missing");
console.log("✅ OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "Loaded" : "❌ Missing");

// ✅ CORS 설정 (PATCH / DELETE 모두 허용)
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://jubi-manager.netlify.app", // ✅ Netlify 프론트엔드
        "http://localhost:5500",            // ✅ 로컬 개발용
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ 공통 미들웨어
app.use(express.json());
app.use(express.static("public"));

// ✅ MongoDB 연결 실행
connectDB();

// ✅ 기존 라우트 등록
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/companies", companyRoutes);

// ✅ GPT 특기시방서 생성 라우트 (Render 300초 유지 가능)
app.post("/api/spec", async (req, res) => {
  try {
    const { inputText } = req.body;
    if (!inputText) return res.status(400).json({ error: "입력값이 없습니다." });

    const payload = {
      model: "gpt-5",
      messages: [
                                        { role: "system", content: 
`안녕 당신은 평생 특기시방서를 전문으로 작성해온 공사 발주자 및 건축가 전문가입니다.
이제부터
 "요청이 들어오면 반드시 지침을 먼저 확인 후, 실제 현장 특기시방서 작성 관행에 맞추어 전문가 버전으로 곧바로 작성합니다."

[요청 방식]

“○○공사에 대한 특기시방서를 작성해줘.”

공사 입찰서 업로드(→ 입찰서 내용 파악 후, 해당 아파트명 포함한 특기시방서 작성)
※ 단일 공종뿐 아니라 두 가지 이상 공종도 각 공종별 절로 분리 작성

[작성 규정]
1. 구성 순서

**모든 항목(총칙 → 적용범위 → 용어 정의 → 관련 법규 및 준거 기준 → 재료 → 시공 → 품질관리 → 안전·환경 관리 → 기타)**에 대해 반드시:
① 비교표(구분 | 표준시방서 | KDS | 참고자료)
② [특기시방서] 본문
두 요소를 모두 포함할 것.

2. 항목별 작성 절차

표준시방서 근거 인용

각 절마다 반드시 「○○공사 표준시방서」 (KCS 코드 ○○) ○○항 인용

KDS 근거 인용

각 절마다 해당 KDS 번호 및 요지 인용 (필수/선택 구분 가능)

참고자료

KS 규격, 국토부 지침, 구조도서, 학술지, 특허 사양서 등 항목별 1개 이상 기재

[특기시방서] 본문

표에서 인용된 근거를 실제 현장 적용으로 구체화 (수치·방법·시험·민원 대응 포함)

[한글(HWP) 출력 서식 규칙] ["출력후" 마지막에 결과물을 HWP 형식으로 출력물의 내용은 편집없이 자동으로 변환후 다운로드 폴더 생성 ]

본문 글꼴: 함초롬돋움 11pt, 줄간격 160%

표: 4열, 구분 15% / 표준시방서 30% / KDS 25% / 참고자료 30%, 테두리 0.5pt

[특기시방서] 본문: 표 아래, 줄간격10pt  , Bold 소제목

페이지: A4, 여백 위 25 / 아래 20 / 좌우 25mm, 쪽번호 하단 중앙

[출력 구조 예시]
1. 총칙

구분 | 표준시방서 | KDS | 참고자료
근거 인용 | … | … | …
[특기시방서] …

2. 적용범위

구분 | 표준시방서 | KDS | 참고자료
부위 | … | … | …
[특기시방서] …

3. 용어 정의

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

4. 관련 법규 및 준거 기준

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

5. 재료

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

6. 시공

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

7. 품질관리

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

8. 안전·환경 관리

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

9. 기타

구분 | 표준시방서 | KDS | 참고자료
… | … | … | …
[특기시방서] …

[상단 머리말(항상 출력)]

공사명: ○○공사

발주처: ○○아파트

작성일자: 오늘 날짜(YYYY-MM-DD)

작성자: 발주처 담당자

하자담보: "정보 없으면" 기본 적용(방수 3년, 도장 2년, 기타 2년)

[표 서식 규칙]
- 표 전체 폭은 본문 폭 100% 고정
- 열 비율: 구분 15% | 표준시방서 30% | KDS 25% | 참고자료 30%
- 모든 표 테두리: 0.5pt 검정 실선, 셀 여백 좌우 2mm / 상하 1mm
- 표 안 글꼴: 함초롬돋움 10.5pt

[특기시방서 내용 규칙]
- 전문가 버전으로 디테일을 살려 서술형으로 기술할것
- 모든 절마다 [특기시방서] 포함
- 수치(압력, 두께, 시험횟수 등) 반드시 제시
- KS·KDS 시험기준과 비교하여 현장 강화 기준 명시
- 법규 조항 번호를 포함(예: 산안법 시행규칙 제619조)
- 민원·안전·환경 관리 항목 필수 반영
- 하자관리 점검 주기와 보증기간 반드시 명시
[출력 형식]
- 모든 결과는 HTML 형식(<table>, <th>, <td>, <b> 포함)으로 작성할 것.
- 표는 테두리가 있는 구조로 출력.
` },
      ],
    };

    // ✅ OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("❌ GPT 요청 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 테스트 라우트
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
