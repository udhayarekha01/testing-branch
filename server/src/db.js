const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_PATH, 'studentmgmt.db');

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    date_of_birth TEXT,
    program TEXT,
    enrollment_date TEXT NOT NULL DEFAULT (date('now')),
    status TEXT NOT NULL DEFAULT 'active'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    instructor TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_on TEXT NOT NULL DEFAULT (date('now')),
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id)
  )`);

  // seed courses if empty
  db.get('SELECT COUNT(*) AS n FROM courses', (err, row) => {
    if (err || row.n > 0) return;
    const seed = [
      ['CS101', 'Introduction to Programming', 4, 'Dr. Alice Ng'],
      ['CS201', 'Data Structures', 4, 'Dr. Bob Chen'],
      ['MATH101', 'Calculus I', 3, 'Prof. Maria Lopez'],
      ['MATH201', 'Linear Algebra', 3, 'Prof. John Ray'],
      ['ENG101', 'Academic Writing', 2, 'Dr. Susan Hall'],
      ['SCI105', 'Physics Fundamentals', 4, 'Dr. Peter Kim']
    ];
    db.run('BEGIN');
    seed.forEach(([code, title, credits, instructor]) => {
      db.run(
        'INSERT OR IGNORE INTO courses (course_code, title, credits, instructor) VALUES (?, ?, ?, ?)',
        [code, title, credits, instructor]
      );
    });
    db.run('COMMIT');
  });
});

module.exports = db;