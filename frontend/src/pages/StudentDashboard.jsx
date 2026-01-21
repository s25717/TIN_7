// frontend/src/components/StudentDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { translations } from "../i18n/i18n.js";

function StudentDashboard({ token, logout, language, studentId }) {
  const t = translations[language]; // Translation object
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!token || !studentId) return;

    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/sessions/student",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };

    fetchSessions();
  }, [token, studentId]);

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <button onClick={logout} style={{ float: "right" }}>
        {t.logout}
      </button>

      <h2>{t.mySessions}</h2>

      {sessions.length === 0 ? (
        <p>{t.noSessions}</p>
      ) : (
        sessions.map((s) => {
          // Find this student's attendance in the session
          const studentSession = s.students?.find(
            (st) => st.student?._id === studentId
          );

          return (
            <div key={s._id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
              <strong>{s.title}</strong><br />
              {new Date(s.date).toLocaleString()}<br />
              {t.teacher}: {s.teacher?.name || "Unknown"} {s.teacher?.surname || ""}<br />
              {t.attendance}: <b>{studentSession?.attendance || "N/A"}</b>
            </div>
          );
        })
      )}
    </div>
  );
}

export default StudentDashboard;
