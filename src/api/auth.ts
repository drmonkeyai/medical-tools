// src/api/auth.ts
export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "locked";
};

const API_BASE = "http://localhost:4000";

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập thất bại");
  }

  return data as { message: string; user: AuthUser };
}

export async function meApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Không lấy được thông tin người dùng");
  }

  return data.user as AuthUser;
}

export async function logoutApi() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any).message || "Đăng xuất thất bại");
  }

  return data;
}