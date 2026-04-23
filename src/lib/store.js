// Tiny client-side persistence layer. Replace with real API calls
// (Express + MongoDB) when wiring up the backend.











import { SEED_COURSES, SEED_USERS } from "./mock-data";

const KEYS = {
  users: "eduvibe.users",
  courses: "eduvibe.courses",
  enrollments: "eduvibe.enrollments",
  transactions: "eduvibe.transactions",
  wishlist: "eduvibe.wishlist",
  passwords: "eduvibe.passwords",
  session: "eduvibe.session",
  pendingOtp: "eduvibe.otp",
  quizAttempts: "eduvibe.quizAttempts",
  seedVersion: "eduvibe.seedVersion"
};

// Bump this when SEED_COURSES change so users get fresh content.
const SEED_VERSION = "3";

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  if (typeof window === "undefined") return;
  const currentVersion = window.localStorage.getItem(KEYS.seedVersion);
  const needsRefresh = currentVersion !== SEED_VERSION;

  if (!window.localStorage.getItem(KEYS.users)) write(KEYS.users, SEED_USERS);
  if (!window.localStorage.getItem(KEYS.courses) || needsRefresh) {
    // Refresh seeded courses but preserve instructor-created ones.
    const existing = read(KEYS.courses, []);
    const seedIds = new Set(SEED_COURSES.map((c) => c.id));
    const userCreated = existing.filter((c) => !seedIds.has(c.id));
    write(KEYS.courses, [...SEED_COURSES, ...userCreated]);
  }
  if (!window.localStorage.getItem(KEYS.enrollments)) write(KEYS.enrollments, []);
  if (!window.localStorage.getItem(KEYS.transactions)) write(KEYS.transactions, []);
  if (!window.localStorage.getItem(KEYS.quizAttempts)) write(KEYS.quizAttempts, []);
  if (!window.localStorage.getItem(KEYS.wishlist)) write(KEYS.wishlist, []);
  if (!window.localStorage.getItem(KEYS.passwords)) {
    write(KEYS.passwords, {
      "admin@eduvibe.edu": "demo1234",
      "thorne@eduvibe.edu": "demo1234",
      "clara@eduvibe.edu": "demo1234",
      "julian@eduvibe.edu": "demo1234",
      "sam@eduvibe.edu": "demo1234"
    });
  }
  if (needsRefresh) window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

// Users
export const Users = {
  all() {
    ensureSeed();
    return read(KEYS.users, []);
  },
  byId(id) {
    return Users.all().find((u) => u.id === id);
  },
  byEmail(email) {
    return Users.all().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  upsert(user) {
    const list = Users.all();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) list[idx] = user;else
    list.push(user);
    write(KEYS.users, list);
  },
  remove(id) {
    write(
      KEYS.users,
      Users.all().filter((u) => u.id !== id)
    );
  }
};

// Auth (mock JWT + OTP)
export const Auth = {
  setPassword(email, password) {
    const map = read(KEYS.passwords, {});
    map[email.toLowerCase()] = password;
    write(KEYS.passwords, map);
  },
  verifyPassword(email, password) {
    const map = read(KEYS.passwords, {});
    return map[email.toLowerCase()] === password;
  },
  signup(name, email, password, role) {
    if (Users.byEmail(email)) throw new Error("An account with this email already exists.");
    const user = {
      id: `u-${Math.random().toString(36).slice(2, 9)}`,
      name,
      email: email.toLowerCase(),
      role,
      avatarColor: ["#E89A4F", "#6B635A", "#A37454", "#2C2825"][
      Math.floor(Math.random() * 4)],

      createdAt: new Date().toISOString()
    };
    Users.upsert(user);
    Auth.setPassword(email, password);
    return user;
  },
  login(email, password) {
    const user = Users.byEmail(email);
    if (!user || !Auth.verifyPassword(email, password)) {
      throw new Error("Invalid email or password.");
    }
    write(KEYS.session, { userId: user.id, token: `mock.${user.id}.${Date.now()}` });
    return user;
  },
  logout() {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEYS.session);
  },
  current() {
    ensureSeed();
    const session = read(KEYS.session, null);
    if (!session) return null;
    return Users.byId(session.userId) ?? null;
  },
  generateOtp(email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    write(KEYS.pendingOtp, { email: email.toLowerCase(), code, ts: Date.now() });
    return code;
  },
  verifyOtp(email, code) {
    const pending = read(
      KEYS.pendingOtp,
      null
    );
    if (!pending) return false;
    return pending.email === email.toLowerCase() && pending.code === code;
  }
};

// Courses
export const Courses = {
  all() {
    ensureSeed();
    return read(KEYS.courses, []);
  },
  bySlug(slug) {
    return Courses.all().find((c) => c.slug === slug);
  },
  byId(id) {
    return Courses.all().find((c) => c.id === id);
  },
  byInstructor(instructorId) {
    return Courses.all().filter((c) => c.instructorId === instructorId);
  },
  upsert(course) {
    const list = Courses.all();
    const idx = list.findIndex((c) => c.id === course.id);
    if (idx >= 0) list[idx] = course;else
    list.push(course);
    write(KEYS.courses, list);
  },
  remove(id) {
    write(
      KEYS.courses,
      Courses.all().filter((c) => c.id !== id)
    );
  }
};

// Enrollments + progress
export const Enrollments = {
  all() {
    ensureSeed();
    return read(KEYS.enrollments, []);
  },
  forUser(userId) {
    return Enrollments.all().filter((e) => e.userId === userId);
  },
  forCourse(courseId) {
    return Enrollments.all().filter((e) => e.courseId === courseId);
  },
  get(userId, courseId) {
    return Enrollments.all().find((e) => e.userId === userId && e.courseId === courseId);
  },
  enroll(userId, courseId) {
    const list = Enrollments.all();
    if (list.some((e) => e.userId === userId && e.courseId === courseId)) return;
    list.push({
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedTopicIds: []
    });
    write(KEYS.enrollments, list);
  },
  toggleTopic(userId, courseId, topicId) {
    const list = Enrollments.all();
    const e = list.find((x) => x.userId === userId && x.courseId === courseId);
    if (!e) return;
    if (e.completedTopicIds.includes(topicId)) {
      e.completedTopicIds = e.completedTopicIds.filter((t) => t !== topicId);
    } else {
      e.completedTopicIds.push(topicId);
    }
    e.lastTopicId = topicId;
    write(KEYS.enrollments, list);
  },
  setLast(userId, courseId, topicId) {
    const list = Enrollments.all();
    const e = list.find((x) => x.userId === userId && x.courseId === courseId);
    if (!e) return;
    e.lastTopicId = topicId;
    write(KEYS.enrollments, list);
  }
};



export const COUPONS = [
{ code: "EDUVIBE10", percentOff: 10, description: "10% off — welcome to EduVibe" },
{ code: "STUDENT25", percentOff: 25, description: "25% student discount" },
{ code: "FOUNDER50", percentOff: 50, description: "50% founders' offer" }];


export const Coupons = {
  all() {
    return COUPONS;
  },
  find(code) {
    return COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  }
};

function nextInvoiceNumber(existing) {
  const max = existing.reduce((m, t) => {
    const n = parseInt(t.invoiceNumber?.split("-")[1] ?? "0", 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `LMN-${String(max + 1).padStart(6, "0")}`;
}

function detectCardBrand(num) {
  const digits = num.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}











export const Transactions = {
  all() {
    ensureSeed();
    return read(KEYS.transactions, []);
  },
  forUser(userId) {
    return Transactions.all().filter((t) => t.userId === userId);
  },
  forCourse(courseId) {
    return Transactions.all().filter((t) => t.courseId === courseId);
  },
  byId(id) {
    return Transactions.all().find((t) => t.id === id);
  },
  /** Process a mock checkout. Returns the created transaction. */
  checkout(input) {
    const list = Transactions.all();
    const coupon = input.couponCode ? Coupons.find(input.couponCode) : undefined;
    const discount = coupon ? Math.round(input.subtotal * (coupon.percentOff / 100)) : 0;
    const amount = Math.max(0, input.subtotal - discount);
    const digits = input.cardNumber.replace(/\D/g, "");
    const tx = {
      id: `tx-${Math.random().toString(36).slice(2, 10)}`,
      invoiceNumber: nextInvoiceNumber(list),
      userId: input.userId,
      courseId: input.courseId,
      subtotal: input.subtotal,
      discount,
      couponCode: coupon?.code,
      amount,
      cardBrand: detectCardBrand(digits),
      cardLast4: digits.slice(-4) || "0000",
      cardholderName: input.cardholderName,
      billingEmail: input.billingEmail,
      status: "paid",
      date: new Date().toISOString()
    };
    list.push(tx);
    write(KEYS.transactions, list);
    return tx;
  },
  refund(id) {
    const list = Transactions.all();
    const t = list.find((x) => x.id === id);
    if (!t) return;
    t.status = "refunded";
    write(KEYS.transactions, list);
  }
};

export const Wishlist = {
  all(userId) {
    ensureSeed();
    const map = read(KEYS.wishlist, {});
    return map[userId] ?? [];
  },
  toggle(userId, courseId) {
    const map = read(KEYS.wishlist, {});
    const list = map[userId] ?? [];
    map[userId] = list.includes(courseId) ?
    list.filter((c) => c !== courseId) :
    [...list, courseId];
    write(KEYS.wishlist, map);
  }
};

export const QuizAttempts = {
  all() {
    ensureSeed();
    return read(KEYS.quizAttempts, []);
  },
  forUser(userId) {
    return QuizAttempts.all().filter((a) => a.userId === userId);
  },
  forTopic(userId, topicId) {
    return QuizAttempts.all().filter((a) => a.userId === userId && a.topicId === topicId);
  },
  best(userId, topicId) {
    const attempts = QuizAttempts.forTopic(userId, topicId);
    if (!attempts.length) return undefined;
    return attempts.reduce((b, a) => a.score > b.score ? a : b);
  },
  record(attempt) {
    const list = QuizAttempts.all();
    list.push({ ...attempt, date: attempt.date ?? new Date().toISOString() });
    write(KEYS.quizAttempts, list);
  }
};

export function progressFor(course, completed) {
  const total = course.modules.reduce((acc, m) => acc + m.topics.length, 0);
  if (total === 0) return 0;
  const done = completed.filter((id) =>
  course.modules.some((m) => m.topics.some((t) => t.id === id))
  ).length;
  return Math.round(done / total * 100);
}

export function flatTopics(course) {
  return course.modules.flatMap((m) => m.topics.map((t) => ({ module: m, topic: t })));
}