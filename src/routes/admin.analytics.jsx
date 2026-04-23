import { useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { BarSeries, Kpi, Panel } from "./admin.index";
import {
  buildStudentRows,
  categoryBreakdown,
  enrollmentsByDay,
  loadAdminSnapshot,
  topCourses } from

"../lib/analytics.js";
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  TrendingUp } from
"lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <AnalyticsPage />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/analytics",
  fullPath: "/admin/analytics",
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
  useEffect(() => { document.title = "Analytics — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function AnalyticsPage() {
  const [snap, setSnap] = useState(null);
  const [range, setRange] = useState(14);

  useEffect(() => {
    setSnap(loadAdminSnapshot());
  }, []);

  const series = useMemo(
    () => snap ? enrollmentsByDay(snap.enrollments, range) : [],
    [snap, range]
  );

  if (!snap) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const top = topCourses(snap.courses, snap.enrollments, 6);
  const cats = categoryBreakdown(snap.courses, snap.enrollments);

  // Quiz breakdown by topic title (only quizzes with attempts)
  const quizMap = new Map();
  for (const a of snap.quizAttempts) {
    const c = snap.courses.find((x) => x.id === a.courseId);
    const t = c?.modules.flatMap((m) => m.topics).find((tp) => tp.id === a.topicId);
    if (!t) continue;
    const key = `${c?.title ?? ""} · ${t.title}`;
    const prev = quizMap.get(key) ?? { title: key, attempts: 0, passes: 0 };
    prev.attempts++;
    if (a.passed) prev.passes++;
    quizMap.set(key, prev);
  }
  const quizRows = [...quizMap.values()].sort((a, b) => b.attempts - a.attempts);

  // Revenue by course
  const revByCourse = new Map();
  for (const t of snap.transactions) {
    revByCourse.set(t.courseId, (revByCourse.get(t.courseId) ?? 0) + t.amount);
  }
  const topRevenue = snap.courses.
  map((c) => ({ course: c, amount: revByCourse.get(c.id) ?? 0 })).
  filter((r) => r.amount > 0).
  sort((a, b) => b.amount - a.amount).
  slice(0, 5);

  const rows = buildStudentRows(snap);
  const engaged = rows.filter((r) => r.enrolledCount > 0).length;

  // Score distribution buckets (0-59 fail, 60-74, 75-89, 90-100)
  const scoreBuckets = [
  { label: "0–59%", color: "bg-red-500/70", count: 0 },
  { label: "60–74%", color: "bg-amber-500/70", count: 0 },
  { label: "75–89%", color: "bg-glow/70", count: 0 },
  { label: "90–100%", color: "bg-emerald-500/70", count: 0 }];

  for (const a of snap.quizAttempts) {
    if (a.score < 60) scoreBuckets[0].count++;else
    if (a.score < 75) scoreBuckets[1].count++;else
    if (a.score < 90) scoreBuckets[2].count++;else
    scoreBuckets[3].count++;
  }
  const totalAttempts = snap.quizAttempts.length;
  const avgScore = totalAttempts ?
  Math.round(snap.quizAttempts.reduce((a, q) => a + q.score, 0) / totalAttempts) :
  0;

  // Course completion rate breakdown
  const completionByCourse = snap.courses.map((c) => {
    const enrolls = snap.enrollments.filter((e) => e.courseId === c.id);
    if (!enrolls.length) return { course: c, rate: 0, students: 0 };
    const done = enrolls.filter(
      (e) =>
      c.modules.reduce((a, m) => a + m.topics.length, 0) > 0 &&
      e.completedTopicIds.filter((id) =>
      c.modules.some((m) => m.topics.some((t) => t.id === id))
      ).length === c.modules.reduce((a, m) => a + m.topics.length, 0)
    ).length;
    return {
      course: c,
      rate: Math.round(done / enrolls.length * 100),
      students: enrolls.length
    };
  }).
  filter((r) => r.students > 0).
  sort((a, b) => b.rate - a.rate).
  slice(0, 6);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Insights
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Platform analytics
          </h1>
        </div>
        <div className="inline-flex rounded-full border border-foreground/10 bg-card p-1 text-xs font-medium">
          {[7, 14, 30].map((n) =>
          <button
            key={n}
            onClick={() => setRange(n)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
            range === n ?
            "bg-foreground text-background" :
            "text-muted-foreground hover:text-foreground"}`
            }>
            
              Last {n}d
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Activity className="size-4" />}
          label="New enrollments"
          value={String(series.reduce((a, b) => a + b.count, 0))}
          hint={`Last ${range} days`} />
        
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Engaged students"
          value={String(engaged)}
          hint={`of ${snap.students.length} total`} />
        
        <Kpi
          icon={<ClipboardCheck className="size-4" />}
          label="Quiz pass rate"
          value={`${snap.quizPassRate}%`}
          hint={`${snap.quizAttempts.length} attempts`} />
        
        <Kpi
          icon={<DollarSign className="size-4" />}
          label="Revenue"
          value={`$${snap.revenue}`}
          hint={`Avg $${
          snap.transactions.length ?
          Math.round(snap.revenue / snap.transactions.length) :
          0} / sale`
          } />
        
      </div>

      <Panel
        icon={<TrendingUp className="size-4" />}
        title={`Enrollments · last ${range} days`}>
        
        <BarSeries data={series} />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          icon={<BookOpen className="size-4" />}
          title="Top courses"
          subtitle="By enrollments">
          
          <ul className="space-y-3">
            {top.map(({ course, students }) => {
              const max = top[0]?.students || 1;
              const pct = Math.round(students / max * 100);
              return (
                <li key={course.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{course.title}</span>
                    <span className="tabular-nums text-muted-foreground">{students}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                  </div>
                </li>);

            })}
          </ul>
        </Panel>

        <Panel icon={<DollarSign className="size-4" />} title="Revenue by course">
          {topRevenue.length === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No paid transactions yet.
            </div> :

          <ul className="space-y-3">
              {topRevenue.map(({ course, amount }) => {
              const max = topRevenue[0]?.amount || 1;
              const pct = Math.round(amount / max * 100);
              return (
                <li key={course.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{course.title}</span>
                      <span className="tabular-nums text-muted-foreground">${amount}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-glow" style={{ width: `${pct}%` }} />
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          icon={<ClipboardCheck className="size-4" />}
          title="Quiz performance by lesson">
          
          {quizRows.length === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No quiz attempts logged yet.
            </div> :

          <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                  <tr className="border-b border-foreground/5">
                    <th className="py-2 text-left font-semibold">Quiz</th>
                    <th className="py-2 text-right font-semibold">Attempts</th>
                    <th className="py-2 text-right font-semibold">Pass rate</th>
                  </tr>
                </thead>
                <tbody>
                  {quizRows.map((r) =>
                <tr key={r.title} className="border-b border-foreground/5 last:border-b-0">
                      <td className="py-2 pr-3">{r.title}</td>
                      <td className="py-2 text-right tabular-nums">{r.attempts}</td>
                      <td className="py-2 text-right tabular-nums">
                        {Math.round(r.passes / r.attempts * 100)}%
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }
        </Panel>

        <Panel icon={<BookOpen className="size-4" />} title="Categories">
          {cats.length === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No data yet.
            </div> :

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
                      className="h-full bg-glow"
                      style={{ width: `${pct}%` }} />
                    
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          icon={<ClipboardCheck className="size-4" />}
          title="Marks distribution"
          subtitle={`Average ${avgScore}% across ${totalAttempts} attempts`}>
          
          {totalAttempts === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No quiz marks yet.
            </div> :

          <div className="flex h-40 items-end gap-3">
              {scoreBuckets.map((b) => {
              const max = Math.max(1, ...scoreBuckets.map((x) => x.count));
              const h = Math.round(b.count / max * 100);
              return (
                <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                      className={`w-full rounded-t-md ${b.color} transition-all`}
                      style={{ height: `${Math.max(h, 6)}%` }}
                      title={`${b.count} attempts`} />
                    
                    </div>
                    <div className="text-xs font-semibold tabular-nums">{b.count}</div>
                    <div className="text-[10px] text-muted-foreground">{b.label}</div>
                  </div>);

            })}
            </div>
          }
        </Panel>

        <Panel
          icon={<TrendingUp className="size-4" />}
          title="Course completion rates"
          subtitle="Share of enrolled students who reached 100%">
          
          {completionByCourse.length === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No completions yet.
            </div> :

          <ul className="space-y-3">
              {completionByCourse.map(({ course, rate, students }) =>
            <li key={course.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{course.title}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {rate}% · {students} enrolled
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                  className="h-full bg-emerald-500/70"
                  style={{ width: `${rate}%` }} />
                
                  </div>
                </li>
            )}
            </ul>
          }
        </Panel>
      </div>
    </>);

}