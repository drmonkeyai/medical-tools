import { useState } from "react";
import { supabase } from "./lib/supabase";
import "./styles/App.css";

function App() {
  const [message, setMessage] = useState("Chưa test");
  const [userInfo, setUserInfo] = useState<any>(null);

  async function handleLogin() {
    setMessage("Đang đăng nhập...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "user@email.com",
      password: "12345678",
    });

    if (error) {
      setMessage("Lỗi đăng nhập: " + error.message);
      console.error("LOGIN ERROR:", error);
      return;
    }

    setMessage("Đăng nhập thành công");
    console.log("LOGIN DATA:", data);
  }

  async function handleGetUser() {
    setMessage("Đang lấy user...");

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setMessage("Lỗi lấy user: " + error.message);
      console.error("GET USER ERROR:", error);
      return;
    }

    setUserInfo(data.user);
    setMessage("Lấy user thành công");
    console.log("CURRENT USER:", data.user);
  }

  async function handleCreateCase() {
    setMessage("Đang tạo case...");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setMessage("Chưa có user đăng nhập");
      console.error("USER ERROR:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("cases")
      .insert([
        {
          user_id: userData.user.id,
          title: "Ca test đầu tiên",
          patient_name: "Nguyen Van A",
          patient_gender: "male",
          notes: "Tạo thử từ React app",
        },
      ])
      .select();

    if (error) {
      setMessage("Lỗi tạo case: " + error.message);
      console.error("CREATE CASE ERROR:", error);
      return;
    }

    setMessage("Tạo case thành công");
    console.log("CREATE CASE DATA:", data);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Lỗi đăng xuất: " + error.message);
      console.error("LOGOUT ERROR:", error);
      return;
    }

    setUserInfo(null);
    setMessage("Đã đăng xuất");
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Test Supabase</h1>

      <p>
        <strong>Trạng thái:</strong> {message}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={handleLogin}>1. Đăng nhập test</button>
        <button onClick={handleGetUser}>2. Lấy user hiện tại</button>
        <button onClick={handleCreateCase}>3. Tạo case test</button>
        <button onClick={handleLogout}>4. Đăng xuất</button>
      </div>

      <pre
        style={{
          background: "#f5f5f5",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(userInfo, null, 2)}
      </pre>
    </div>
  );
}

export default App;