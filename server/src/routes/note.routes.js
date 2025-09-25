import { Router } from "express";
import {
  createNote, listNotes, getNote, updateNote, deleteNote, stats, getSubjects
} from "../controllers/note.controller.js";

const r = Router();

r.get("/", listNotes);
r.post("/", createNote);
r.get("/stats", stats);
r.get("/subjects", getSubjects);
r.get("/:id", getNote);
r.put("/:id", updateNote);
r.delete("/:id", deleteNote);

export default r;