import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import noteRouter from "./routes/note.routes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/subject", (_req, res) => res.json({ ok: true }));

app.use("/api/notes", noteRouter); // Thay đổi endpoint

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.VITE_API_URL)
  .then(() => {
    app.listen(PORT, () => console.log("Server on http://localhost:" + PORT));
  })
  .catch((err) => {
    console.error("DB connect error:", err.message);
    process.exit(1);
  });