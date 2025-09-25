import { useEffect, useState } from "react";
import { api } from "../services/api";

// Hàm tiện ích để định dạng ngày
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function Home() {
  const [form, setForm] = useState({ title: "", content: "", subject: "" });
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  
  // State cho bộ lọc
  const [query, setQuery] = useState({ 
    subject: "", 
    page: 1, 
    limit: 4,
    from: "",
    to: "" 
  });
  
  // State để lưu danh sách môn học
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState([]);

  // Hàm gọi API lấy danh sách ghi chú
  const fetchList = async () => {
    const params = {
      page: query.page,
      limit: query.limit,
      subject: query.subject,
      from: query.from,
      to: query.to
    };
    // Chỉ gửi những params có giá trị
    Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

    const res = await api.get("/notes", { params });
    setData(res.data);
  };

  // Hàm gọi API lấy danh sách môn học
  const fetchSubjects = async () => {
    try {
      const res = await api.get("/notes/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };
  
  const fetchStats = async () => {
      try {
        const res = await api.get("/notes/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
  };

  // Tự động gọi API khi query thay đổi
  useEffect(() => {
    fetchList();
  }, [query]);

  // Gọi API lấy danh sách môn học khi component được render lần đầu
  useEffect(() => {
    fetchSubjects();
    fetchStats();
  }, []);

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery(prev => ({ ...prev, [name]: value, page: 1 }));
  };
  
  // Xử lý việc tạo ghi chú mới
  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    await api.post("/notes", form);
    setForm({ title: "", content: "", subject: "" }); // Reset form
    
    // Tải lại danh sách ghi chú và môn học
    fetchList(); 
    fetchSubjects();
    fetchStats();
  };
  
  // Xử lý Archive/Unarchive
  const onToggleArchive = async (id, archived) => {
    await api.put(`/notes/${id}`, { archived: !archived });
    fetchList();
  };

  // Xử lý xóa
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await api.delete(`/notes/${id}`);
      fetchList();
      fetchSubjects();
      fetchStats();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-400">EduNotes 📝</h1>
        <p className="text-gray-400">Your Academic Note Management</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* === Cột Trái: Danh sách ghi chú === */}
        <div className="md:w-2/3 space-y-4">
          <h2 className="text-2xl font-semibold text-teal-300 border-b-2 border-gray-700 pb-2">My Notes</h2>
          <div className="space-y-4">
            {data.items.length > 0 ? data.items.map((note) => (
              <div key={note._id} className={`p-4 border border-gray-700 rounded-lg ${note.archived ? "bg-gray-800 opacity-60" : "bg-gray-800"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-teal-400">{note.title}</h3>
                        <span className="text-xs text-teal-500 bg-gray-700 px-2 py-1 rounded-full inline-block">{note.subject}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">Created on: {formatDate(note.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <button onClick={() => onToggleArchive(note._id, note.archived)} className="text-sm text-yellow-500 hover:text-yellow-400 whitespace-nowrap">
                        {note.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button onClick={() => onDelete(note._id)} className="text-sm text-red-600 hover:text-red-500">Delete</button>
                  </div>
                </div>
              </div>
            )) : <p className="text-gray-500">No notes found. Try adjusting your filters or add a new note!</p>}
          </div>
           {/* Phân trang */}
          {data.pages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                disabled={data.page <= 1}
                onClick={() => setQuery({ ...query, page: data.page - 1 })}
              >
                Prev
              </button>
              <span className="text-gray-400">Page {data.page} / {data.pages}</span>
              <button
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                disabled={data.page >= data.pages}
                onClick={() => setQuery({ ...query, page: data.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* === Cột Phải: Form và Filter === */}
        <div className="md:w-1/3 space-y-8">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-teal-300 mb-4">Add New Note</h2>
            <form onSubmit={onCreate} className="space-y-4">
              <input name="title" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Note Title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
              <textarea name="content" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Note Content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}/>
              <input name="subject" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Subject (e.g., Math)..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}/>
              <button className="w-full px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition">Add Note</button>
            </form>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-teal-300">Filters</h2>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <select name="subject" value={query.subject} onChange={handleQueryChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">From</label>
                    <input type="date" name="from" value={query.from} onChange={handleQueryChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">To</label>
                    <input type="date" name="to" value={query.to} onChange={handleQueryChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-teal-300">Thống kê</h2>
            <ul className="space-y-2">
              {stats.map(stat => (
                <li key={stat._id} className="flex justify-between text-gray-400">
                  <span>{stat._id}</span>
                  <span>{stat.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}