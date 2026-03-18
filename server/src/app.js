import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);

app.listen(config.port, () => {
  console.log("Server chạy tại http://localhost:" + config.port);
});