import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import {
  buildStudentRows,
  categoryBreakdown,
  enrollmentsByDay,
  loadAdminSnapshot,
  topCourses } from

"../lib/analytics.js";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Users } from
"lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <AdminOverview />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/",
  fullPath: "/admin/",
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
  useEffect(() => { document.title = "Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function AdminOverview() {
  const [snap, setSnap] = useState(null);

  useEffect(() => {
    setSnap(loadAdminSnapshot());
  }, []);

  if (!snap) {
    return (
      <div className="text-sm text-muted-foreground">Loading analytics…</div>);

  }

  const series = enrollmentsByDay(snap.enrollments, 14);
  const top = topCourses(snap.courses, snap.enrollments, 5);
  const cats = categoryBreakdown(snap.courses, snap.enrollments);
  const students = buildStudentRows(snap).
  sort((a, b) => (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "")).
  slice(0, 6);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Administration
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            System overview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Real-time signal across enrollments, learning progress, quiz performance and
            revenue. Drill into Analytics or Students for the full picture.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">
            
            Open analytics <ArrowUpRight className="size-4" />
          </Link>
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            
            View students
          </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Users className="size-4" />}
          label="Active learners"
          value={String(snap.activeLearners)}
          hint={`${snap.students.length} students total`} />
        
        <Kpi
          icon={<BookOpen className="size-4" />}
          label="Published courses"
          value={String(snap.courses.length)}
          hint={`${snap.enrollments.length} enrollments`} />
        
        <Kpi
          icon={<CheckCircle2 className="size-4" />}
          label="Avg. progress"
          value={`${snap.averageProgress}%`}
          hint={`${snap.completedEnrollments} completions`} />
        
        <Kpi
          icon={<DollarSign className="size-4" />}
          label="Revenue"
          value={`$${snap.revenue}`}
          hint={`${snap.transactions.length} transactions`} />
        
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          icon={<TrendingUp className="size-4" />}
          title="Enrollments · last 14 days"
          subtitle={`${series.reduce((a, b) => a + b.count, 0)} new in this window`}>
          
          <BarSeries data={series} />
        </Panel>

        <Panel
          icon={<ClipboardCheck className="size-4" />}
          title="Quiz performance"
          subtitle={`${snap.quizAttempts.length} attempts logged`}>
          
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <div className="text-5xl font-semibold tracking-tight">
                {snap.quizPassRate}%
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                pass rate across all quizzes
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MiniStat
                label="Passed"
                value={String(snap.quizAttempts.filter((a) => a.passed).length)} />
              
              <MiniStat
                label="Failed"
                value={String(snap.quizAttempts.filter((a) => !a.passed).length)} />
              
            </div>
          </div>
        </Panel>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <Panel
          icon={<BookOpen className="size-4" />}
          title="Top courses"
          subtitle="Ranked by total enrollments">
          
          {top.length === 0 ?
          <Empty>No enrollments yet.</Empty> :

          <ul className="space-y-3">
              {top.map(({ course, students: count }) =>
            <li
              key={course.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3">
              
                  <div className="min-w-0">
                    <Link
                  to={`/courses/${course.slug}`}
                  className="block truncate font-medium hover:text-glow">
                  
                      {course.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {course.category} · {course.level}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                    {count} {count === 1 ? "student" : "students"}
                  </div>
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel
          icon={<GraduationCap className="size-4" />}
          title="Categories"
          subtitle="Where learners are spending their time">
          
          {cats.length === 0 ?
          <Empty>No category data yet.</Empty> :

          <ul className="space-y-3">
              {cats.map(({ category, count }) => {
              const max = cats[0]?.count || 1;
              const pct = Math.round(count / max * 100);
              return (
                <li key={category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                      className="h-full bg-glow transition-all"
                      style={{ width: `${pct}%` }} />
                    
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Panel>
      </div>

      <Panel
        icon={<Users className="size-4" />}
        title="Recent learners"
        subtitle="Most recent activity across the platform"
        action={
        <Link
          to="/admin/students"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          
            See all
          </Link>
        }>
        
        {students.length === 0 ?
        <Empty>No student activity yet.</Empty> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-foreground/5">
                  <th className="py-2 text-left font-semibold">Student</th>
                  <th className="py-2 text-left font-semibold">Enrolled</th>
                  <th className="py-2 text-left font-semibold">Avg. progress</th>
                  <th className="py-2 text-left font-semibold">Quiz pass</th>
                  <th className="py-2 text-right font-semibold">Spent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) =>
              <tr key={row.user.id} className="border-b border-foreground/5 last:border-b-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                      className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: row.user.avatarColor }}>
                      
                          {row.user.name.
                      split(" ").
                      map((n) => n[0]).
                      slice(0, 2).
                      join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{row.user.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {row.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 tabular-nums">{row.enrolledCount}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                        className="h-full bg-glow"
                        style={{ width: `${row.averageProgress}%` }} />
                      
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {row.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 tabular-nums">
                      {row.quizAttempts ? `${row.quizPassRate}%` : "—"}
                    </td>
                    <td className="py-3 text-right tabular-nums">${row.spent}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </Panel>
    </>);

}

export function Kpi({
  icon,
  label,
  value,
  hint





}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>);

}

export function Panel({
  icon,
  title,
  subtitle,
  action,
  children






}) {
  return (
    <section className="rounded-2xl border border-foreground/5 bg-card p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {icon}
            {title}
          </div>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {action}
      </header>
      {children}
    </section>);

}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>);

}

function Empty({ children }) {
  return (
    <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>);

}

export function BarSeries({
  data


}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-44 items-end gap-1.5">
      {data.map((d, i) => {
        const h = Math.round(d.count / max * 100);
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-glow/80 transition-all group-hover:bg-glow"
                style={{ height: `${Math.max(h, 4)}%` }}
                title={`${d.count} on ${d.label}`} />
              
            </div>
            <div className="text-[10px] tabular-nums text-muted-foreground">
              {d.label.split(" ")[1]}
            </div>
          </div>);

      })}
    </div>);

}