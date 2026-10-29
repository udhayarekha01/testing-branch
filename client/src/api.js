const API = '';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  listStudents: () => request('/api/students'),
  getStudent: (id) => request(`/api/students/${id}`),
  createStudent: (body) => request('/api/students', { method: 'POST', body }),
  updateStudent: (id, body) => request(`/api/students/${id}`, { method: 'PUT', body }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: 'DELETE' }),
  listCourses: () => request('/api/courses'),
  createCourse: (body) => request('/api/courses', { method: 'POST', body }),
  listEnrollments: () => request('/api/enrollments'),
  enroll: (studentId, courseId) => request('/api/enrollments', { method: 'POST', body: { student_id: studentId, course_id: courseId } }),
  unenroll: (id) => request(`/api/enrollments/${id}`, { method: 'DELETE' }),
  setGrade: (id, grade) => request(`/api/enrollments/${id}/grade`, { method: 'PATCH', body: { grade } }),
  performanceReport: () => request('/api/reports/performance')
};

export const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];