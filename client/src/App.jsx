import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import StudentsPage from './pages/StudentsPage.jsx';
import EnrollmentsPage from './pages/EnrollmentsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

const TABS = [
  { key: 'students', label: 'Students' },
  { key: 'enrollments', label: 'Enrollments & Grades' },
  { key: 'reports', label: 'Performance Reports' }
];

export default function App() {
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshStudents = useCallback(async () => {
    try { setStudents(await api.listStudents()); setError(null); }
    catch (e) { setError(e.message); }
  }, []);

  const refreshCourses = useCallback(async () => {
    try { setCourses(await api.listCourses()); } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { refreshStudents(); refreshCourses(); }, [refreshStudents, refreshCourses]);

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 Student Management Dashboard</h1>
        <p className="subtitle">Register students · Track academic progress · Manage enrollments · Generate reports</p>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {toast && <div className="banner banner-success" role="status">{toast}</div>}
      <main>
        {tab === 'students' && (
          <StudentsPage students={students} courses={courses} notify={notify} onChanged={refreshStudents} />
        )}
        {tab === 'enrollments' && (
          <EnrollmentsPage students={students} courses={courses} notify={notify} onChanged={refreshStudents} />
        )}
        {tab === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}