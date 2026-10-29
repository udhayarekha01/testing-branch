import React, { useState } from 'react';
import { api } from '../api.js';

export default function StudentsPage({ students, notify, onChanged }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', date_of_birth: '', program: '' });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setFormError(null);
    try {
      await api.createStudent(form);
      setForm({ first_name: '', last_name: '', email: '', date_of_birth: '', program: '' });
      notify('Student registered successfully');
      await onChanged();
    } catch (err) { setFormError(err.message); }
    finally { setBusy(false); }
  }

  async function toggleStatus(s) {
    try {
      await api.updateStudent(s.id, { status: s.status === 'active' ? 'inactive' : 'active' });
      notify(`${s.first_name} ${s.last_name} marked ${s.status === 'active' ? 'inactive' : 'active'}`);
      await onChanged();
    } catch (err) { setFormError(err.message); }
  }

  async function remove(s) {
    if (!window.confirm(`Delete ${s.first_name} ${s.last_name} and all their enrollments?`)) return;
    try {
      await api.deleteStudent(s.id);
      notify('Student deleted');
      await onChanged();
    } catch (err) { setFormError(err.message); }
  }

  const filtered = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email} ${s.program || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid-2">
      <section className="card">
        <h2>Register New Student</h2>
        {formError && <div className="banner banner-error" role="alert">{formError}</div>}
        <form onSubmit={submit} className="form">
          <label>First Name* <input required value={form.first_name} onChange={set('first_name')} placeholder="Jane" /></label>
          <label>Last Name* <input required value={form.last_name} onChange={set('last_name')} placeholder="Doe" /></label>
          <label>Email* <input required type="email" value={form.email} onChange={set('email')} placeholder="jane@school.edu" /></label>
          <label>Date of Birth <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} /></label>
          <label>Program <input value={form.program} onChange={set('program')} placeholder="BSc Computer Science" /></label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Registering…' : 'Register Student'}</button>
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Students ({filtered.length})</h2>
          <input className="search" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Program</th><th>Courses</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="empty">No students yet — register one on the left.</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className={s.status === 'inactive' ? 'row-muted' : ''}>
                  <td><strong>{s.first_name} {s.last_name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.program || '—'}</td>
                  <td>{s.enrolled_courses} enrolled / {s.graded_courses} graded</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{s.status}</span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-small" onClick={() => toggleStatus(s)}>
                      {s.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(s)}>Delete</button>
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