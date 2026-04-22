import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import {
  Courses,
  Enrollments,
  QuizAttempts,
  Transactions,
  Users,
  progressFor } from
"../lib/store.js";
import { Certificates } from "../lib/certificates.js";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Mail,
  TrendingUp } from
"lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/students/$id",
  fullPath: "/admin/students/$id",
  useParams: () => useParams(),
  useSearch: () => {
    const _loc = useLocation();
    const _sp = new URLSearchParams(_loc.search);
    const _o = {};
    _sp.forEach((v, k) => { _o[k] = v; });
    return _o;
  },
};

export default function _Page() {
  useEffect(() => { document.title = "Student ${params.id} — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setUser(Users.byId(id) ?? null);
    setResolved(true);
  }, [id]);

  if (!resolved) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-foreground/10 p-12 text-center">
        <p className="text-sm text-muted-foreground">Student not found.</p>
        <button
          onClick={() => navigate(`/admin/students`)}
          className="mt-4 text-sm text-glow hover:underline">
          
          ← Back to students
        </button>
      </div>);

  }

  const enrolls = Enrollments.forUser(user.id);
  const attempts = QuizAttempts.forUser(user.id).sort((a, b) =>
  a.date.localeCompare(b.date)
  );
  const certs = Certificates.forUser(user.id);
  const txs = Transactions.forUser(user.id);

  const courseRows = enrolls.map((e) => {
    const c = Courses.byId(e.courseId);
    if (!c) return null;
    const progress = progressFor(c, e.completedTopicIds);
    const total = c.modules.reduce((a, m) => a + m.topics.length, 0);
    const done = e.completedTopicIds.length;
    const courseAttempts = attempts.filter((a) => a.courseId === c.id);
    const avgScore = courseAttempts.length ?
    Math.round(courseAttempts.reduce((s, a) => s + a.score, 0) / courseAttempts.length) :
    null;
    return { course: c, progress, done, total, attempts: courseAttempts, avgScore };
  }).filter(Boolean);








  const avgProgress = courseRows.length ?
  Math.round(courseRows.reduce((a, r) => a + r.progress, 0) / courseRows.length) :
  0;
  const completedCourses = courseRows.filter((r) => r.progress === 100).length;
  const passRate = attempts.length ?
  Math.round(attempts.filter((a) => a.passed).length / attempts.length * 100) :
  0;
  const totalSpent = txs.
  filter((t) => t.status === "paid").
  reduce((a, t) => a + t.amount, 0);
  const lastActivity = [
  ...enrolls.map((e) => e.enrolledAt),
  ...attempts.map((a) => a.date),
  ...txs.map((t) => t.date)].
  sort().pop();

  // Score chart (last 12 attempts)
  const recent = attempts.slice(-12);
  const maxChart = 100;

  return (
    <>
      <button
        onClick={() => navigate(`/admin/students`)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> Back to students
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-5 rounded-3xl border border-foreground/5 bg-card p-6">
        <div
          className="flex size-20 items-center justify-center rounded-full text-2xl font-semibold text-white"
          style={{ backgroundColor: user.avatarColor }}>
          
          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Student profile
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{user.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> {user.email}
            </span>
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            {lastActivity &&
            <span>Last active {new Date(lastActivity).toLocaleDateString()}</span>
            }
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile
          icon={<BookOpen className="size-4" />}
          label="Enrolled"
          value={String(enrolls.length)} />
        
        <Tile
          icon={<CheckCircle2 className="size-4" />}
          label="Completed"
          value={String(completedCourses)} />
        
        <Tile
          icon={<TrendingUp className="size-4" />}
          label="Avg progress"
          value={`${avgProgress}%`} />
        
        <Tile
          icon={<ClipboardCheck className="size-4" />}
          label="Quiz pass rate"
          value={attempts.length ? `${passRate}%` : "—"}
          hint={`${attempts.length} attempts`} />
        
        <Tile
          icon={<DollarSign className="size-4" />}
          label="Spent"
          value={`$${totalSpent.toFixed(0)}`} />
        
      </div>

      {/* Score chart */}
      <section className="mb-8 rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quiz score history · last {recent.length} attempts
        </div>
        {recent.length === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No quiz attempts yet.
          </div> :

        <div className="relative h-48">
            {/* gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map((v) =>
            <div
              key={v}
              className="flex items-center gap-2 border-t border-dashed border-foreground/5">
              
                  <span className="w-8 -translate-y-2 text-[10px] text-muted-foreground">
                    {v}%
                  </span>
                </div>
            )}
            </div>
            {/* line + dots */}
            <svg
            className="absolute inset-0 ml-10"
            viewBox={`0 0 ${recent.length * 40} 100`}
            preserveAspectRatio="none">
            
              <polyline
              fill="none"
              stroke="oklch(0.72 0.16 60)"
              strokeWidth="1.5"
              points={recent.
              map((a, i) => `${i * 40 + 20},${100 - a.score}`).
              join(" ")} />
            
              {recent.map((a, i) =>
            <circle
              key={i}
              cx={i * 40 + 20}
              cy={100 - a.score}
              r="3"
              fill={a.passed ? "rgb(16 185 129)" : "rgb(239 68 68)"} />

            )}
            </svg>
          </div>
        }
      </section>

      {/* Course progress */}
      <section className="mb-8 rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Course progress
        </div>
        {courseRows.length === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Not enrolled in any courses yet.
          </div> :

        <div className="space-y-4">
            {courseRows.map((r) =>
          <div
            key={r.course.id}
            className="flex flex-col gap-3 rounded-2xl bg-secondary/30 p-4 sm:flex-row sm:items-center">
            
                <div className="min-w-0 flex-1">
                  <Link
                to={`/courses/${r.course.slug}`}
                className="font-medium hover:text-glow">
                
                    {r.course.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {r.done}/{r.total} lessons ·{" "}
                    {r.avgScore !== null ? `avg quiz ${r.avgScore}%` : "no quizzes"}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                  className={`h-full rounded-full ${
                  r.progress === 100 ? "bg-emerald-500/80" : "bg-glow"}`
                  }
                  style={{ width: `${r.progress}%` }} />
                
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tabular-nums">
                    {r.progress}%
                  </div>
                </div>
              </div>
          )}
          </div>
        }
      </section>

      {/* Certificates + payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-foreground/5 bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Award className="size-3.5" /> Certificates ({certs.length})
          </div>
          {certs.length === 0 ?
          <p className="text-sm text-muted-foreground">No certificates earned yet.</p> :

          <ul className="space-y-2">
              {certs.map((c) => {
              const course = Courses.byId(c.courseId);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3 text-sm">
                  
                    <div>
                      <div className="font-medium">{course?.title ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.issuedAt).toLocaleDateString()} · {c.score}%
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.id}
                    </span>
                  </li>);

            })}
            </ul>
          }
        </section>

        <section className="rounded-3xl border border-foreground/5 bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <DollarSign className="size-3.5" /> Payments ({txs.length})
          </div>
          {txs.length === 0 ?
          <p className="text-sm text-muted-foreground">No transactions.</p> :

          <ul className="space-y-2">
              {txs.map((t) => {
              const c = Courses.byId(t.courseId);
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3 text-sm">
                  
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c?.title ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.invoiceNumber} ·{" "}
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums">
                        ${t.amount.toFixed(0)}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">
                        {t.status}
                      </div>
                    </div>
                  </li>);

            })}
            </ul>
          }
        </section>
      </div>
    </>);

}

function Tile({
  icon,
  label,
  value,
  hint





}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>);

}