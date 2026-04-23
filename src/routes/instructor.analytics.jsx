import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments, QuizAttempts, Users, progressFor } from "../lib/store.js";
import { Certificates } from "../lib/certificates.js";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  Users as UsersIcon } from
"lucide-react";
import { Kpi, Panel } from "./admin.index";


function _PageInline() {
  return (
  <DashboardShell requireRole="instructor">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/instructor/analytics",
  fullPath: "/instructor/analytics",
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
  useEffect(() => { document.title = "Analytics — Instructor — Lumen"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  if (!user) return null;

  const myCourses = Courses.byInstructor(user.id);
  const courseIds = new Set(myCourses.map((c) => c.id));
  const enrollments = Enrollments.all().filter((e) => courseIds.has(e.courseId));
  const quizAttempts = QuizAttempts.all().filter((a) => courseIds.has(a.courseId));
  const certificates = Certificates.all().filter((c) => courseIds.has(c.courseId));

  const totalStudents = new Set(enrollments.map((e) => e.userId)).size;
  const completionRate = enrollments.length ?
  Math.round(
    enrollments.filter((e) => {
      const c = myCourses.find((x) => x.id === e.courseId);
      return c && progressFor(c, e.completedTopicIds) === 100;
    }).length /
    enrollments.length *
    100
  ) :
  0;
  const avgQuizScore = quizAttempts.length ?
  Math.round(quizAttempts.reduce((a, q) => a + q.score, 0) / quizAttempts.length) :
  0;
  const passRate = quizAttempts.length ?
  Math.round(quizAttempts.filter((a) => a.passed).length / quizAttempts.length * 100) :
  0;

  // Per-course breakdown
  const courseRows = myCourses.map((course) => {
    const enrolls = enrollments.filter((e) => e.courseId === course.id);
    const progresses = enrolls.map((e) => progressFor(course, e.completedTopicIds));
    const avgProgress = progresses.length ?
    Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) :
    0;
    const completed = progresses.filter((p) => p === 100).length;
    const courseQuizzes = quizAttempts.filter((a) => a.courseId === course.id);
    const avgScore = courseQuizzes.length ?
    Math.round(courseQuizzes.reduce((a, q) => a + q.score, 0) / courseQuizzes.length) :
    0;
    const certCount = certificates.filter((c) => c.courseId === course.id).length;
    return {
      course,
      students: enrolls.length,
      avgProgress,
      completed,
      avgScore,
      attempts: courseQuizzes.length,
      certCount
    };
  });

  // Per-student leaderboard (across instructor's courses)
  const studentMap = new Map(








  );
  for (const e of enrollments) {
    const c = myCourses.find((x) => x.id === e.courseId);
    if (!c) continue;
    const prog = progressFor(c, e.completedTopicIds);
    const prev = studentMap.get(e.userId) ?? {
      userId: e.userId,
      enrolled: 0,
      avgProgress: 0,
      avgScore: 0,
      certs: 0
    };
    prev.enrolled += 1;
    prev.avgProgress += prog;
    studentMap.set(e.userId, prev);
  }
  for (const [uid, row] of studentMap.entries()) {
    row.avgProgress = Math.round(row.avgProgress / row.enrolled);
    const myAttempts = quizAttempts.filter((a) => a.userId === uid);
    row.avgScore = myAttempts.length ?
    Math.round(myAttempts.reduce((a, q) => a + q.score, 0) / myAttempts.length) :
    0;
    row.certs = certificates.filter((c) => c.userId === uid).length;
  }
  const leaderboard = [...studentMap.values()].
  sort((a, b) => b.avgProgress - a.avgProgress || b.avgScore - a.avgScore).
  slice(0, 10);

  return (
    <>
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Instructor analytics
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Performance overview
        </h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<UsersIcon className="size-4" />}
          label="Students"
          value={String(totalStudents)}
          hint={`${enrollments.length} enrollments`} />
        
        <Kpi
          icon={<CheckCircle2 className="size-4" />}
          label="Completion rate"
          value={`${completionRate}%`}
          hint={`${certificates.length} certificates issued`} />
        
        <Kpi
          icon={<ClipboardCheck className="size-4" />}
          label="Avg quiz score"
          value={`${avgQuizScore}%`}
          hint={`${quizAttempts.length} attempts`} />
        
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Quiz pass rate"
          value={`${passRate}%`}
          hint="across all checkpoints" />
        
      </div>

      <Panel
        icon={<BookOpen className="size-4" />}
        title="Per-course performance"
        subtitle="Marks, progress and certificates issued">
        
        {courseRows.length === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No courses yet — create one to see analytics.
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-foreground/5">
                  <th className="py-2 text-left font-semibold">Course</th>
                  <th className="py-2 text-right font-semibold">Students</th>
                  <th className="py-2 text-left font-semibold">Avg progress</th>
                  <th className="py-2 text-right font-semibold">Completed</th>
                  <th className="py-2 text-right font-semibold">Avg score</th>
                  <th className="py-2 text-right font-semibold">Certs</th>
                </tr>
              </thead>
              <tbody>
                {courseRows.map((r) =>
              <tr key={r.course.id} className="border-b border-foreground/5 last:border-b-0">
                    <td className="py-3 pr-3">
                      <Link
                    to={`/courses/${r.course.slug}`}
                    className="font-medium hover:text-glow">
                    
                        {r.course.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {r.course.category} · {r.course.level}
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{r.students}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                        className="h-full bg-glow"
                        style={{ width: `${r.avgProgress}%` }} />
                      
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {r.avgProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{r.completed}</td>
                    <td className="py-3 text-right tabular-nums">
                      {r.attempts ? `${r.avgScore}%` : "—"}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Award className="size-3.5 text-glow" />
                        {r.certCount}
                      </span>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </Panel>

      <div className="mt-6">
        <Panel
          icon={<UsersIcon className="size-4" />}
          title="Top learners"
          subtitle="Across your courses, ranked by progress and score">
          
          {leaderboard.length === 0 ?
          <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              No student activity yet.
            </div> :

          <ul className="space-y-2">
              {leaderboard.map((s, i) => {
              const u = Users.byId(s.userId);
              if (!u) return null;
              return (
                <li
                  key={s.userId}
                  className="flex items-center gap-4 rounded-xl bg-secondary/40 px-4 py-3">
                  
                    <div className="w-6 text-sm font-bold tabular-nums text-muted-foreground">
                      {i + 1}
                    </div>
                    <div
                    className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: u.avatarColor }}>
                    
                      {u.name.
                    split(" ").
                    map((n) => n[0]).
                    slice(0, 2).
                    join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.enrolled} enrolled · {s.certs} certificates
                      </div>
                    </div>
                    <div className="hidden flex-col items-end sm:flex">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Progress
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {s.avgProgress}%
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Avg score
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {s.avgScore ? `${s.avgScore}%` : "—"}
                      </div>
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Panel>
      </div>
    </>);

}