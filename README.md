# Student Management Dashboard

A full-stack application that lets administrators register students, track academic
progress, manage course enrollments, and generate performance reports.

## Architecture

- **Backend** (`server/`): Node.js + Express + SQLite (sqlite3). REST API on port 3001,
  serves the built frontend in production.
- **Frontend** (`client/`): React 18 + Vite. Dashboard UI, dev proxy to the API.

## Features

- **Register students** — name, email, date of birth, program; activate/deactivate/delete.
- **Manage enrollments** — enroll students in courses (6 seeded courses), remove enrollments,
  prevent duplicates.
- **Track academic progress** — record letter grades per enrollment; per-student GPA is
  computed credit-weighted (A=4.0 … F=0.0).
- **Performance reports** — class summary (total students, graded count, class average GPA),
  per-student GPA table with sorting, and GPA band distribution.

## API Overview

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/students` | List / register students |
| GET/PUT/DELETE | `/api/students/:id` | Detail (with GPA + enrollments) / update / delete |
| GET/POST | `/api/courses` | List / create courses |
| GET/POST | `/api/enrollments` | List / create enrollment |
| DELETE | `/api/enrollments/:id` | Remove enrollment |
| PATCH | `/api/enrollments/:id/grade` | Set/clear letter grade |
| GET | `/api/reports/performance` | Performance report with GPA stats |

Data is stored in `server/data/studentmgmt.db` (auto-created, gitignored).
