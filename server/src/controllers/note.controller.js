import Note from "../models/note.model.js";

// Create
export const createNote = async (req, res) => {
  const { title, content, subject } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }
  const note = await Note.create({ 
    title: title.trim(), 
    content: content.trim(), 
    subject: subject?.trim() || "General" 
  });
  return res.status(201).json(note);
};

// List + filters + pagination
export const listNotes = async (req, res) => {
  const { page = 1, limit = 10, subject, archived, from, to } = req.query;

  const q = {};
  if (subject) {
    q.subject = { $regex: subject, $options: "i" };
  }
  if (archived === "true") q.archived = true;
  if (archived === "false") q.archived = false;

  // *** THÊM LOGIC LỌC THEO NGÀY ***
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) {
        // Thêm 1 ngày để bao gồm cả ngày kết thúc
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        q.createdAt.$lt = endDate;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Note.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Note.countDocuments(q)
  ]);
  return res.json({
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.ceil(total / Number(limit))
  });
};

export const getSubjects = async (_req, res) => {
  try {
      const subjects = await Note.distinct("subject");
      res.json(subjects.sort()); // Sắp xếp theo alphabet
  } catch (error) {
      res.status(500).json({ message: "Error fetching subjects" });
  }
};

// Get one
export const getNote = async (req, res) => {
  const doc = await Note.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  return res.json(doc);
};

// Update
export const updateNote = async (req, res) => {
  const { title, content, subject, archived } = req.body;
  const doc = await Note.findByIdAndUpdate(
    req.params.id,
    { title, content, subject, archived },
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ message: "Not found" });
  return res.json(doc);
};

// Delete
export const deleteNote = async (req, res) => {
  const doc = await Note.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  return res.json({ ok: true });
};

// Stats (aggregation)
export const stats = async (_req, res) => {
    const agg = await Note.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(agg);
  };