// Reviews & ratings store. Persists user reviews per course in localStorage,
// merged with seeded reviews already on the Course object.

import { Courses } from "./store";

const KEY = "eduvibe.reviews";

function read() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function write(list) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export const Reviews = {
  /** All reviews for a course = persisted user reviews + seeded ones. */
  forCourse(courseId) {
    const persisted = read().filter((r) => r.courseId === courseId);
    const course = Courses.byId(courseId);
    const seeded = (course?.reviews ?? []).filter(
      (r) => !persisted.some((p) => p.id === r.id)
    );
    return [...persisted, ...seeded].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  /** Find this user's review for a course (if any). */
  forUserCourse(userId, courseId) {
    return read().find((r) => r.courseId === courseId && r.userId === userId);
  },
  /** Create or update the signed-in user's review for a course. */
  upsert(user, courseId, rating, comment) {
    const list = read();
    const idx = list.findIndex((r) => r.courseId === courseId && r.userId === user.id);
    if (idx >= 0) {
      const existing = list[idx];
      const updated = {
        ...existing,
        rating,
        comment,
        date: new Date().toISOString()
      };
      list[idx] = updated;
      write(list);
      return updated;
    }
    const review = {
      id: `rev-${Math.random().toString(36).slice(2, 10)}`,
      courseId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString()
    };
    list.push(review);
    write(list);
    return review;
  },
  remove(reviewId) {
    write(read().filter((r) => r.id !== reviewId));
  },
  /** Add or update an instructor reply on a persisted user review. */
  reply(reviewId, instructor, message) {
    const list = read();
    const idx = list.findIndex((r) => r.id === reviewId);
    if (idx < 0) return;
    list[idx] = {
      ...list[idx],
      instructorReply: {
        instructorId: instructor.id,
        instructorName: instructor.name,
        message,
        date: new Date().toISOString()
      }
    };
    write(list);
  }
};








export function ratingStats(course) {
  const all = Reviews.forCourse(course.id);
  const distribution = [0, 0, 0, 0, 0];
  for (const r of all) {
    const i = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    distribution[i] = (distribution[i] ?? 0) + 1;
  }
  const count = all.length;
  const average =
  count === 0 ?
  0 :
  all.reduce((acc, r) => acc + r.rating, 0) / count;
  return { average: Math.round(average * 10) / 10, count, distribution };
}