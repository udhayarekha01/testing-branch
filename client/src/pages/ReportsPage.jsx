import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

function gpaColor(gpa) {
  if (gpa === null) return 'muted';
  if (gpa >= 3.7) return 'good';
  if (gpa >= 3.0) return 'ok';
  if (gpa >= 2.0) return 'warn';
  return 'bad';
}

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('gpa_desc');

  useEffect(() => {
    api.performanceReport().then(setReport).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="banner banner-error" role="alert">{error}</div>;
  if (!report) return <p className="empty">Loading report…</p>;

  const rows = [...report.students].sort((a, b) => {
    if (sort === 'name') return `${a.last_name}`.localeCompare(`${b.last_name}`);
    if (sort === 'gpa_asc') return (a.gpa ?? 999) - (b.gpa ?? 999);
    return (b.gpa ?? -1) - (a.gpa ?? -1);
  });

  const { summary } = report;

  return (
    <div>
      <div className="stats">
        <div className="stat"><span className="stat-value">{summary.total_students}</span><span className="stat-label">Total Students</span></div>
        <div className="stat"><span className="stat-value">{summary.students_with_grades}</span><span className="stat-label">With Grades</span></div>
        <div className="stat"><span className="stat-value">{summary.class_average_gpa ?? '—'}</span><span className="stat-label">Class Avg GPA</span></div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Student Performance Report</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort report">
            <option value="gpa_desc">Sort: GPA (high → low)</option>
            <option value="gpa_asc">Sort: GPA (low → high)</option>
            <option value="name">Sort: Name (A → Z)</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Program</th><th>Courses</th><th>Graded</th><th>GPA</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.first_name} {s.last_name}</strong></td>
                  <td>{s.program || '—'}</td>
                  <td>{s.courses}</td>
                  <td>{s.graded}</td>
                  <td><span className={`gpa gpa-${gpaColor(s.gpa)}`}>{s.gpa ?? '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>GPA Distribution</h2>
        {Object.keys(summary.distribution).length === 0 && <p className="empty">No graded students yet — record grades in the Enrollments tab.</p>}
        {Object.entries(summary.distribution).map(([band, count]) => (
          <div key={band} className="dist-row">
            <span className="dist-band">{band}</span>
            <div className="dist-bar">
              <div className="dist-fill" style={{ width: `${(count / summary.students_with_grades) * 100}%` }} />
            </div>
            <span className="dist-count">{count}</span>
          </div>
        ))}
      </section>
    </div>
  );
}