

import { Courses, Enrollments, QuizAttempts, Transactions, Users, progressFor } from "./store";




export function loadAdminSnapshot() {
  const users = Users.all();
  const students = users.filter((u) => u.role === "student");
  const instructors = users.filter((u) => u.role === "instructor");
  const courses = Courses.all();
  const enrollments = Enrollments.all();
  const transactions = Transactions.all();
  const quizAttempts = QuizAttempts.all();
  const revenue = transactions.reduce((a, t) => a + t.amount, 0);

  const progresses = enrollments.map((e) => {
    const c = courses.find((x) => x.id === e.courseId);
    return c ? progressFor(c, e.completedTopicIds) : 0;
  });
  const averageProgress = progresses.length ?
  Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) :
  0;
  const completedEnrollments = progresses.filter((p) => p === 100).length;
  const activeLearners = new Set(enrollments.map((e) => e.userId)).size;
  const quizPassRate = quizAttempts.length ?
  Math.round(quizAttempts.filter((a) => a.passed).length / quizAttempts.length * 100) :
  0;

  return {
    users,
    students,
    instructors,
    courses,
    enrollments,
    transactions,
    quizAttempts,
    revenue,
    activeLearners,
    completedEnrollments,
    averageProgress,
    quizPassRate
  };
}

/** Enrollments per day for the last `days` days (oldest first). */
export function enrollmentsByDay(enrollments, days = 14) {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    buckets.push({
      iso,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0
    });
  }
  for (const e of enrollments) {
    const day = e.enrolledAt.slice(0, 10);
    const b = buckets.find((x) => x.iso === day);
    if (b) b.count++;
  }
  return buckets;
}

/** Returns top N courses ordered by enrolled student count. */
export function topCourses(courses, enrollments, n = 5) {
  const counts = new Map();
  for (const e of enrollments) counts.set(e.courseId, (counts.get(e.courseId) ?? 0) + 1);
  return courses.
  map((c) => ({ course: c, students: counts.get(c.id) ?? 0 })).
  sort((a, b) => b.students - a.students).
  slice(0, n);
}

/** Enrollment counts grouped by course category. */
export function categoryBreakdown(courses, enrollments) {
  const map = new Map();
  for (const e of enrollments) {
    const c = courses.find((x) => x.id === e.courseId);
    if (!c) continue;
    map.set(c.category, (map.get(c.category) ?? 0) + 1);
  }
  return [...map.entries()].
  map(([category, count]) => ({ category, count })).
  sort((a, b) => b.count - a.count);
}












export function buildStudentRows(snap) {
  return snap.students.map((u) => {
    const myEnrolls = snap.enrollments.filter((e) => e.userId === u.id);
    const progresses = myEnrolls.map((e) => {
      const c = snap.courses.find((x) => x.id === e.courseId);
      return c ? progressFor(c, e.completedTopicIds) : 0;
    });
    const avg = progresses.length ?
    Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) :
    0;
    const myAttempts = snap.quizAttempts.filter((a) => a.userId === u.id);
    const passed = myAttempts.filter((a) => a.passed).length;
    const spent = snap.transactions.
    filter((t) => t.userId === u.id).
    reduce((a, t) => a + t.amount, 0);
    const lastActivity = [
    ...myEnrolls.map((e) => e.enrolledAt),
    ...myAttempts.map((a) => a.date)].
    sort().
    pop();
    return {
      user: u,
      enrolledCount: myEnrolls.length,
      completedCount: progresses.filter((p) => p === 100).length,
      averageProgress: avg,
      quizAttempts: myAttempts.length,
      quizPassRate: myAttempts.length ? Math.round(passed / myAttempts.length * 100) : 0,
      spent,
      lastActivity
    };
  });
}