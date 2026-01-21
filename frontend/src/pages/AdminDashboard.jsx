import { useEffect, useState } from "react";
import axios from "axios";
import { translations } from "../i18n/i18n.js";

function AdminDashboard({ token, logout, language }) {
  const t = translations[language];

  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [form, setForm] = useState({
    title: "",
    date: "",
    subject: "",
    teacherId: "",
    groupId: "",
  });

  // ---------------- Fetch data ----------------
  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:5000/api/users/teachers", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTeachers(res.data))
      .catch(console.error);

    axios.get("http://localhost:5000/api/groups", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGroups(res.data))
      .catch(console.error);

    axios.get("http://localhost:5000/api/sessions/admin", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSessions(res.data))
      .catch(console.error);
  }, [token]);

  // ---------------- Form handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/sessions", form, { headers: { Authorization: `Bearer ${token}` } });
      setSessions(prev => [...prev, res.data]);
      setForm({ title: "", date: "", subject: "", teacherId: "", groupId: "" });
    } catch (err) {
      console.error("Create session error:", err);
    }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  // ---------------- Render ----------------
  return (
    <div style={{ maxWidth: "900px", margin: "20px auto" }}>
      <button onClick={logout} style={{ float: "right" }}>{t.logout}</button>
      <h2>{t.allSessions}</h2>

      {/* Add session form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <h3>{t.addSession}</h3>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />

        <select name="teacherId" value={form.teacherId} onChange={handleChange} required>
          <option value="">{t.selectTeacher}</option>
          {teachers.map(tch => <option key={tch._id} value={tch._id}>{tch.name} {tch.surname}</option>)}
        </select>

        <select name="groupId" value={form.groupId} onChange={handleChange} required>
          <option value="">{t.selectGroup}</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <button type="submit">{t.addSession}</button>
      </form>

      {/* Sessions list */}
      {sessions.length === 0 ? <p>{t.noSessions}</p> :
        sessions.map(s => (
          <div key={s._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <strong>{s.title}</strong> — {new Date(s.date).toLocaleString()} <br />
            {t.teacher}: {s.teacher?.name} {s.teacher?.surname} <br />
            {t.group}: {s.group?.name}

            <ul>
              {s.students.map(st => (
                <li key={st.student._id}>
                  {st.student.name} {st.student.surname} — {st.attendance}
                </li>
              ))}
            </ul>

            <button onClick={() => deleteSession(s._id)} style={{ background: "red", color: "white" }}>
              {t.deleteSession}
            </button>
          </div>
        ))
      }
    </div>
  );
}

export default AdminDashboard;
