import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import noteRouter from "./routes/note.routes.js";

dotenv.config();

const allowedOrigins = [
  "https://edunotes-three.vercel.app", // domain chính
  "https://edunotes-git-main-vudinhtran2312-gmailcoms-projects.vercel.app/", // domain preview
  "http://localhost:5173" // để test local FE
];

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.endsWith(".vercel.app") ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/subject", (_req, res) => res.json({ ok: true }));

app.use("/api/notes", noteRouter); // Thay đổi endpoint

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log("Server on http://localhost:" + PORT));
  })
  .catch((err) => {
    console.error("DB connect error:", err.message);
    process.exit(1);
  });