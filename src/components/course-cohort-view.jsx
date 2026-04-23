// Reusable per-course cohort analytics view, used by both admin and instructor.
import { Link } from "react-router-dom";import { useEffect, useMemo } from "react";
import {
  Enrollments,
  QuizAttempts,
  Transactions,
  Users,
  flatTopics,
  progressFor } from
"../lib/store.js";
import { Certificates } from "../lib/certificates.js";

import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  PlayCircle,
  Users as UsersIcon } from
"lucide-react";







export function CourseCohortView({ course, studentLinkBase = "admin" }) {
  const data = useMemo(() => buildCohort(course), [course]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {course.category} · {course.level}
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{course.subtitle}</p>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile
          icon={<UsersIcon className="size-4" />}
          label="Enrolled"
          value={String(data.enrolled)} />
        
        <Tile
          icon={<PlayCircle className="size-4" />}
          label="Started"
          value={String(data.started)}
          hint={`${pct(data.started, data.enrolled)}% of enrolled`} />
        
        <Tile
          icon={<CheckCircle2 className="size-4" />}
          label="Completed"
          value={String(data.completed)}
          hint={`${pct(data.completed, data.enrolled)}% completion`} />
        
        <Tile
          icon={<ClipboardCheck className="size-4" />}
          label="Quiz avg"
          value={data.attemptCount ? `${data.avgScore}%` : "—"}
          hint={`${data.attemptCount} attempts`} />
        
        <Tile
          icon={<DollarSign className="size-4" />}
          label="Revenue"
          value={`$${data.revenue.toFixed(0)}`} />
        
      </div>

      {/* Funnel */}
      <section className="rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Conversion funnel
        </div>
        <div className="space-y-3">
          {[
          { label: "Enrolled", value: data.enrolled, color: "bg-foreground" },
          { label: "Started learning", value: data.started, color: "bg-glow" },
          {
            label: "Half-way (≥50%)",
            value: data.halfway,
            color: "bg-amber-500/80"
          },
          {
            label: "Completed (100%)",
            value: data.completed,
            color: "bg-emerald-500/80"
          },
          {
            label: "Earned certificate",
            value: data.certs,
            color: "bg-purple-500/80"
          }].
          map((step) => {
            const max = Math.max(1, data.enrolled);
            const w = Math.round(step.value / max * 100);
            return (
              <div key={step.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {step.value} ({pct(step.value, data.enrolled)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${step.color} transition-all`}
                    style={{ width: `${Math.max(w, 2)}%` }} />
                  
                </div>
              </div>);

          })}
        </div>
      </section>

      {/* Drop-off by lesson */}
      <section className="rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Lesson completion
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          % of enrolled students who marked each lesson complete. Lower bars = drop-off
          points.
        </p>
        {data.enrolled === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No enrollments yet.
          </div> :

        <div className="flex h-48 items-end gap-1">
            {data.lessonStats.map((l) => {
            const h = Math.round(l.completionRate / 100 * 100);
            const isDip =
            l.completionRate <
            Math.max(20, data.lessonStats[0].completionRate - 30);
            return (
              <div
                key={l.topicId}
                className="group relative flex flex-1 flex-col items-center"
                title={`${l.title} — ${l.completionRate}% (${l.completed}/${data.enrolled})`}>
                
                  <div className="flex w-full flex-1 items-end">
                    <div
                    className={`w-full rounded-t-sm transition-all ${
                    isDip ? "bg-red-500/70" : "bg-glow/80"}`
                    }
                    style={{ height: `${Math.max(h, 4)}%` }} />
                  
                  </div>
                </div>);

          })}
          </div>
        }
        {data.lessonStats.length > 0 &&
        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>Lesson 1</span>
            <span>Lesson {data.lessonStats.length}</span>
          </div>
        }
      </section>

      {/* Quiz heatmap */}
      <section className="rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quiz difficulty
        </div>
        {data.quizStats.length === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No quizzes recorded for this course.
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-foreground/5">
                  <th className="py-2 text-left font-semibold">Quiz</th>
                  <th className="py-2 text-right font-semibold">Attempts</th>
                  <th className="py-2 text-right font-semibold">Avg score</th>
                  <th className="py-2 text-right font-semibold">Pass rate</th>
                  <th className="py-2 text-left font-semibold pl-6">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {data.quizStats.map((q) =>
              <tr key={q.topicId} className="border-b border-foreground/5 last:border-b-0">
                    <td className="py-3 pr-3">{q.title}</td>
                    <td className="py-3 text-right tabular-nums">{q.attempts}</td>
                    <td className="py-3 text-right tabular-nums">
                      {q.attempts ? `${q.avgScore}%` : "—"}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {q.attempts ? `${q.passRate}%` : "—"}
                    </td>
                    <td className="py-3 pl-6">
                      <DifficultyCell passRate={q.passRate} attempts={q.attempts} />
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </section>

      {/* Roster */}
      <section className="rounded-3xl border border-foreground/5 bg-card p-6">
        <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Roster · {data.roster.length} students
        </div>
        {data.roster.length === 0 ?
        <div className="rounded-xl bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No one enrolled yet.
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-foreground/5">
                  <th className="py-2 text-left font-semibold">Student</th>
                  <th className="py-2 text-left font-semibold">Progress</th>
                  <th className="py-2 text-right font-semibold">Quiz avg</th>
                  <th className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.roster.map((s) => {
                const u = Users.byId(s.userId);
                if (!u) return null;
                const NameCell =
                <div className="flex items-center gap-3">
                      <div
                    className="flex size-8 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: u.avatarColor }}>
                    
                        {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>;

                return (
                  <tr key={u.id} className="border-b border-foreground/5 last:border-b-0">
                      <td className="py-3 pr-3">
                        {studentLinkBase === "admin" ?
                      <Link
                        to={`/admin/students/${u.id}`}
                        className="hover:opacity-80">
                        
                            {NameCell}
                          </Link> :

                      NameCell
                      }
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
                            <div
                            className={`h-full ${
                            s.progress === 100 ? "bg-emerald-500/80" : "bg-glow"}`
                            }
                            style={{ width: `${s.progress}%` }} />
                          
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {s.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {s.attempts ? `${s.avgScore}%` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {s.hasCert ?
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
                            <Award className="size-3" /> Certified
                          </span> :
                      s.progress === 100 ?
                      <span className="text-xs text-muted-foreground">Complete</span> :
                      s.progress > 0 ?
                      <span className="text-xs text-muted-foreground">In progress</span> :

                      <span className="text-xs text-muted-foreground">Not started</span>
                      }
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>);

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

function DifficultyCell({ passRate, attempts }) {
  if (!attempts) return <span className="text-xs text-muted-foreground">—</span>;
  const tone =
  passRate >= 80 ?
  { label: "Easy", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" } :
  passRate >= 60 ?
  { label: "Moderate", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" } :
  { label: "Hard", className: "bg-red-500/15 text-red-700 dark:text-red-400" };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.className}`}>
      
      {tone.label}
    </span>);

}

function pct(part, whole) {
  if (!whole) return 0;
  return Math.round(part / whole * 100);
}

function buildCohort(course) {
  const enrollments = Enrollments.forCourse(course.id);
  const attempts = QuizAttempts.all().filter((a) => a.courseId === course.id);
  const certificates = Certificates.all().filter((c) => c.courseId === course.id);
  const txs = Transactions.forCourse(course.id);

  const enrolled = enrollments.length;
  const started = enrollments.filter((e) => e.completedTopicIds.length > 0).length;
  const halfway = enrollments.filter(
    (e) => progressFor(course, e.completedTopicIds) >= 50
  ).length;
  const completed = enrollments.filter(
    (e) => progressFor(course, e.completedTopicIds) === 100
  ).length;
  const certs = certificates.length;
  const avgScore = attempts.length ?
  Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) :
  0;
  const revenue = txs.
  filter((t) => t.status === "paid").
  reduce((a, t) => a + t.amount, 0);

  // Lesson stats
  const lessonStats = flatTopics(course).map(({ topic }) => {
    const c = enrollments.filter((e) =>
    e.completedTopicIds.includes(topic.id)
    ).length;
    return {
      topicId: topic.id,
      title: topic.title,
      completed: c,
      completionRate: pct(c, enrolled)
    };
  });

  // Quiz stats
  const quizTopics = flatTopics(course).
  filter(({ topic }) => topic.type === "quiz").
  map(({ topic }) => topic);
  const quizStats = quizTopics.map((t) => {
    const tAttempts = attempts.filter((a) => a.topicId === t.id);
    return {
      topicId: t.id,
      title: t.title,
      attempts: tAttempts.length,
      avgScore: tAttempts.length ?
      Math.round(tAttempts.reduce((s, a) => s + a.score, 0) / tAttempts.length) :
      0,
      passRate: tAttempts.length ?
      Math.round(
        tAttempts.filter((a) => a.passed).length / tAttempts.length * 100
      ) :
      0
    };
  });

  // Roster
  const roster = enrollments.map((e) => {
    const myAttempts = attempts.filter((a) => a.userId === e.userId);
    return {
      userId: e.userId,
      progress: progressFor(course, e.completedTopicIds),
      attempts: myAttempts.length,
      avgScore: myAttempts.length ?
      Math.round(myAttempts.reduce((s, a) => s + a.score, 0) / myAttempts.length) :
      0,
      hasCert: certificates.some((c) => c.userId === e.userId)
    };
  }).
  sort((a, b) => b.progress - a.progress);

  return {
    enrolled,
    started,
    halfway,
    completed,
    certs,
    avgScore,
    attemptCount: attempts.length,
    revenue,
    lessonStats,
    quizStats,
    roster
  };
}