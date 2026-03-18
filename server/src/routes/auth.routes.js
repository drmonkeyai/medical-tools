import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { findUserByEmail } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

function buildSafeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = signToken(user);

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("POST /auth/login error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng nhập",
    });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("POST /auth/logout error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng xuất",
    });
  }
});

router.get("/me", authRequired, (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("GET /auth/me error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy thông tin người dùng",
    });
  }
});

export default router;