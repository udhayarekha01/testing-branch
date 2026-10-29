const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const db = require('./db');

// ---- helpers -----------------------------------------------------------
const GPA_SCALE = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
};

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}
function qOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

const wrap = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error(err);
    if (err && err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Duplicate record: ' + err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  });
};

function computeGpa(grades) {
  // grades: [{grade, credits}]
  let totalPoints = 0, totalCredits = 0;
  for (const g of grades) {
    if (g.grade && GPA_SCALE[g.grade] !== undefined) {
      totalPoints += GPA_SCALE[g.grade] * g.credits;
      totalCredits += g.credits;
    }
  }
  return totalCredits ? +(totalPoints / totalCredits).toFixed(2) : null;
}

// ---- students ----------------------------------------------------------
app.get('/api/students', wrap(async (req, res) => {
  const rows = await q(`
    SELECT s.*,
           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.id) AS enrolled_courses,
           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.id AND e.grade IS NOT NULL) AS graded_courses
    FROM students s ORDER BY s.last_name, s.first_name`);
  res.json(rows);
}));

app.get('/api/students/:id', wrap(async (req, res) => {
  const student = await qOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const enrollments = await q(`
    SELECT e.id, e.grade, e.enrolled_on, c.id AS course_id, c.course_code, c.title, c.credits, c.instructor
    FROM enrollments e JOIN courses c ON c.id = e.course_id
    WHERE e.student_id = ? ORDER BY c.course_code`, [req.params.id]);
  const gpa = computeGpa(enrollments.filter(e => e.grade).map(e => ({ grade: e.grade, credits: e.credits })));
  res.json({ ...student, enrollments, gpa });
}));

app.post('/api/students', wrap(async (req, res) => {
  const { first_name, last_name, email, date_of_birth, program } = req.body || {};
  const errors = [];
  if (!first_name || !String(first_name).trim()) errors.push('first_name is required');
  if (!last_name || !String(last_name).trim()) errors.push('last_name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push('valid email is required');
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  const r = await run(
    'INSERT INTO students (first_name, last_name, email, date_of_birth, program) VALUES (?, ?, ?, ?, ?)',
    [first_name.trim(), last_name.trim(), email.trim().toLowerCase(), date_of_birth || null, program || null]
  );
  const student = await qOne('SELECT * FROM students WHERE id = ?', [r.id]);
  res.status(201).json(student);
}));

app.put('/api/students/:id', wrap(async (req, res) => {
  const student = await qOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const b = req.body || {};
  const next = {
    first_name: b.first_name ?? student.first_name,
    last_name: b.last_name ?? student.last_name,
    email: b.email ?? student.email,
    date_of_birth: b.date_of_birth ?? student.date_of_birth,
    program: b.program ?? student.program,
    status: b.status ?? student.status
  };
  await run('UPDATE students SET first_name=?, last_name=?, email=?, date_of_birth=?, program=?, status=? WHERE id=?',
    [next.first_name, next.last_name, next.email, next.date_of_birth, next.program, next.status, req.params.id]);
  res.json(await qOne('SELECT * FROM students WHERE id = ?', [req.params.id]));
}));

app.delete('/api/students/:id', wrap(async (req, res) => {
  const r = await run('DELETE FROM students WHERE id = ?', [req.params.id]);
  if (!r.changes) return res.status(404).json({ error: 'Student not found' });
  res.status(204).end();
}));

// ---- courses -----------------------------------------------------------
app.get('/api/courses', wrap(async (req, res) => {
  res.json(await q('SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled FROM courses c ORDER BY c.course_code'));
}));

app.post('/api/courses', wrap(async (req, res) => {
  const { course_code, title, credits, instructor } = req.body || {};
  if (!course_code || !title) return res.status(400).json({ error: 'course_code and title are required' });
  const r = await run('INSERT INTO courses (course_code, title, credits, instructor) VALUES (?, ?, ?, ?)',
    [course_code.trim(), title.trim(), credits || 3, instructor || null]);
  res.status(201).json(await qOne('SELECT * FROM courses WHERE id = ?', [r.id]));
}));

// ---- enrollments --------------------------------------------------------
app.get('/api/enrollments', wrap(async (req, res) => {
  res.json(await q(`
    SELECT e.id, e.grade, e.enrolled_on, s.id AS student_id, s.first_name, s.last_name,
           c.id AS course_id, c.course_code, c.title, c.credits
    FROM enrollments e
    JOIN students s ON s.id = e.student_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY s.last_name, c.course_code`));
}));

app.post('/api/enrollments', wrap(async (req, res) => {
  const { student_id, course_id } = req.body || {};
  if (!student_id || !course_id) return res.status(400).json({ error: 'student_id and course_id are required' });
  const student = await qOne('SELECT id FROM students WHERE id = ?', [student_id]);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const course = await qOne('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  try {
    const r = await run('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id]);
    res.status(201).json(await qOne('SELECT * FROM enrollments WHERE id = ?', [r.id]));
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Student is already enrolled in this course' });
    }
    throw err;
  }
}));

app.delete('/api/enrollments/:id', wrap(async (req, res) => {
  const r = await run('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
  if (!r.changes) return res.status(404).json({ error: 'Enrollment not found' });
  res.status(204).end();
}));

app.patch('/api/enrollments/:id/grade', wrap(async (req, res) => {
  const grade = (req.body || {}).grade;
  const valid = [null, ...Object.keys(GPA_SCALE)];
  if (!valid.includes(grade)) {
    return res.status(400).json({ error: `Invalid grade. Must be one of: ${Object.keys(GPA_SCALE).join(', ')}` });
  }
  const r = await run('UPDATE enrollments SET grade = ? WHERE id = ?', [grade, req.params.id]);
  if (!r.changes) return res.status(404).json({ error: 'Enrollment not found' });
  res.json(await qOne('SELECT * FROM enrollments WHERE id = ?', [req.params.id]));
}));

// ---- reports -----------------------------------------------------------
app.get('/api/reports/performance', wrap(async (req, res) => {
  const students = await q(`
    SELECT s.id, s.first_name, s.last_name, s.program,
           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.id) AS courses,
           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.id AND e.grade IS NOT NULL) AS graded
    FROM students s ORDER BY s.last_name`);
  const detailed = [];
  for (const s of students) {
    const enrollments = await q(`
      SELECT e.grade, c.credits FROM enrollments e JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?`, [s.id]);
    const gpa = computeGpa(enrollments.filter(e => e.grade).map(e => ({ grade: e.grade, credits: e.credits })));
    detailed.push({ ...s, gpa });
  }
  const graded = detailed.filter(s => s.gpa !== null);
  const classGpa = graded.length ? +(graded.reduce((a, s) => a + s.gpa, 0) / graded.length).toFixed(2) : null;
  const distribution = {};
  for (const s of graded) {
    const band = s.gpa >= 3.7 ? 'A (3.7-4.0)' : s.gpa >= 3.0 ? 'B (3.0-3.69)' : s.gpa >= 2.0 ? 'C (2.0-2.99)' : 'D/F (<2.0)';
    distribution[band] = (distribution[band] || 0) + 1;
  }
  res.json({
    summary: {
      total_students: detailed.length,
      students_with_grades: graded.length,
      class_average_gpa: classGpa,
      distribution
    },
    students: detailed
  });
}));

// serve frontend production build if present
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Student Management API listening on http://localhost:${PORT}`));