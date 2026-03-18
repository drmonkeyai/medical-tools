import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { findUserById } from "../db.js";

export function authRequired(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }

    next();
  };
}