import jwt from "jsonwebtoken";

export const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰이 없습니다." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "관리자 권한이 없습니다." });
    }
    next();
  } catch {
    res.status(403).json({ message: "토큰 검증 실패" });
  }
};
