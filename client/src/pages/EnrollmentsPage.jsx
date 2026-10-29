import React, { useEffect, useState } from 'react';
import { api, GRADES } from '../api.js';

export default function EnrollmentsPage({ students, courses, notify }) {
  const [enrollments, setEnrollments] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try { setEnrollments(await api.listEnrollments()); } catch (e) { setError(e.message); }
  }
  useEffect(() => { refresh(); }, []);

  async function enroll(e) {
    e.preventDefault();
    if (!studentId || !courseId) return;
    setBusy(true);
    try {
      await api.enroll(studentId, courseId);
      notify('Student enrolled');
      setCourseId('');
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function unenroll(id, name) {
    if (!window.confirm(`Remove enrollment for ${name}?`)) return;
    try { await api.unenroll(id); notify('Enrollment removed'); await refresh(); }
    catch (e) { setError(e.message); }
  }

  async function grade(id, value, name) {
    try {
      await api.setGrade(id, value || null);
      notify(`Grade ${value || 'cleared'} recorded for ${name}`);
      await refresh();
    } catch (e) { setError(e.message); }
  }

  return (
    <div>
      <section className="card">
        <h2>Enroll a Student in a Course</h2>
        {error && <div className="banner banner-error" role="alert">{error}</div>}
        <form onSubmit={enroll} className="form-inline">
          <label>
            Student
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
              ))}
            </select>
          </label>
          <label>
            Course
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_code} — {c.title} ({c.credits} credits)</option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Enrolling…' : 'Enroll'}</button>
        </form>
      </section>

      <section className="card">
        <h2>All Enrollments ({enrollments.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Credits</th><th>Enrolled On</th><th>Grade</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr><td colSpan="6" className="empty">No enrollments yet.</td></tr>
              )}
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.first_name} {e.last_name}</strong></td>
                  <td>{e.course_code} — {e.title}</td>
                  <td>{e.credits}</td>
                  <td>{e.enrolled_on}</td>
                  <td>
                    <select
                      value={e.grade || ''}
                      onChange={(ev) => grade(e.id, ev.target.value, `${e.first_name} ${e.last_name} · ${e.course_code}`)}
                      aria-label={`Grade for ${e.first_name} ${e.last_name} in ${e.course_code}`}
                    >
                      <option value="">Not graded</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-small btn-danger" onClick={() => unenroll(e.id, `${e.first_name} ${e.last_name} · ${e.course_code}`)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}