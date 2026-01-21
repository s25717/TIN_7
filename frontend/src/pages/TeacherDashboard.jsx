import { useEffect, useState } from "react";
import axios from "axios";

function TeacherDashboard({ token, logout }) {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", subject: "", groupId: "" });

  // ---------------- Fetch groups & sessions ----------------
  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:5000/api/groups", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGroups(res.data))
      .catch(console.error);

    axios.get("http://localhost:5000/api/sessions/teacher", { headers: { Authorization: `Bearer ${token}` } })
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
      setForm({ title: "", date: "", subject: "", groupId: "" });
    } catch (err) {
      console.error("Create session error:", err);
    }
  };

  // ---------------- Update attendance ----------------
  const updateAttendance = async (sessionId, studentId, attendance) => {
    try {
      await axios.put(`http://localhost:5000/api/sessions/${sessionId}/students/${studentId}`, { attendance }, { headers: { Authorization: `Bearer ${token}` } });

      setSessions(prev => prev.map(sess => 
        sess._id === sessionId
          ? { ...sess, students: sess.students.map(s => s.student._id === studentId ? { ...s, attendance } : s) }
          : sess
      ));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Render ----------------
  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <button onClick={logout} style={{ float: "right" }}>Logout</button>
      <h2>My Sessions</h2>

      {/* Add session form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />

        <select name="groupId" value={form.groupId} onChange={handleChange} required>
          <option value="">Select group</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <button type="submit">Add Session</button>
      </form>

      {/* Sessions list */}
      <ul>
        {sessions.map(sess => (
          <li key={sess._id} style={{ marginBottom: "20px" }}>
            <strong>{sess.title}</strong> — {new Date(sess.date).toLocaleString()} <br />
            <em>{sess.subject}</em> — Group: {sess.group?.name}

            <div style={{ marginTop: "10px" }}>
              {sess.students.map(st => (
                <div key={st.student._id} style={{ marginBottom: "5px" }}>
                  {st.student.name} {st.student.surname}

                  <select
                    value={st.attendance}
                    style={{ marginLeft: "10px" }}
                    onChange={e => updateAttendance(sess._id, st.student._id, e.target.value)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherDashboard;
