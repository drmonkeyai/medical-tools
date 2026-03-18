import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  );
`);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function findUserById(id) {
  return db.prepare(`
    SELECT
      id,
      full_name,
      email,
      password_hash,
      role,
      status,
      created_at,
      updated_at,
      last_login_at
    FROM users
    WHERE id = ?
  `).get(id);
}

export function findUserByEmail(email) {
  return db.prepare(`
    SELECT
      id,
      full_name,
      email,
      password_hash,
      role,
      status,
      created_at,
      updated_at,
      last_login_at
    FROM users
    WHERE email = ?
  `).get(normalizeEmail(email));
}

export function createUser({
  full_name,
  email,
  password_hash,
  role = "user",
  status = "active",
}) {
  const stmt = db.prepare(`
    INSERT INTO users (
      full_name,
      email,
      password_hash,
      role,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    String(full_name || "").trim(),
    normalizeEmail(email),
    password_hash,
    role,
    status
  );

  return findUserById(result.lastInsertRowid);
}

export function updateUser({
  id,
  full_name,
  email,
  password_hash,
  role,
  status,
}) {
  const current = findUserById(id);
  if (!current) return null;

  const nextFullName =
    full_name !== undefined ? String(full_name).trim() : current.full_name;
  const nextEmail =
    email !== undefined ? normalizeEmail(email) : current.email;
  const nextPasswordHash =
    password_hash !== undefined ? password_hash : current.password_hash;
  const nextRole = role !== undefined ? role : current.role;
  const nextStatus = status !== undefined ? status : current.status;

  db.prepare(`
    UPDATE users
    SET
      full_name = ?,
      email = ?,
      password_hash = ?,
      role = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    nextFullName,
    nextEmail,
    nextPasswordHash,
    nextRole,
    nextStatus,
    id
  );

  return findUserById(id);
}

export function updateLastLogin(id) {
  db.prepare(`
    UPDATE users
    SET
      last_login_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);

  return findUserById(id);
}

export function listUsers() {
  return db.prepare(`
    SELECT
      id,
      full_name,
      email,
      role,
      status,
      created_at,
      updated_at,
      last_login_at
    FROM users
    ORDER BY created_at DESC, id DESC
  `).all();
}

export function deleteUser(id) {
  const current = findUserById(id);
  if (!current) return null;

  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return current;
}