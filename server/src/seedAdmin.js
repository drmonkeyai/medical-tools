import bcrypt from "bcrypt";
import { config } from "./config.js";
import { findUserByEmail, createUser } from "./db.js";

const existing = findUserByEmail(config.adminEmail);

if (existing) {
  console.log("Admin đã tồn tại");
  process.exit();
}

const hash = await bcrypt.hash(config.adminPassword, 10);

createUser({
  full_name: config.adminName,
  email: config.adminEmail,
  password_hash: hash,
  role: "admin",
  status: "active",
});

console.log("Đã tạo admin:");
console.log("Email:", config.adminEmail);
console.log("Password:", config.adminPassword);