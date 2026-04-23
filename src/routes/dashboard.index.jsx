import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments, Transactions, progressFor } from "../lib/store.js";
import { BookOpen, Receipt, Trophy } from "lucide-react";


export const Route = {
  path: "/dashboard/",
  fullPath: "/dashboard/",
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
  useEffect(() => { document.title = "Dashboard — EduVibe"; }, []);
  return <StudentDashboard />;
}


function StudentDashboard() {
  return (
    <DashboardShell requireRole="student">
      <Inner />
    </DashboardShell>);

}

function Inner() {
  const { user } = useAuth();
  if (!user) return null;
  const enrollments = Enrollments.forUser(user.id);
  const txs = Transactions.forUser(user.id);
  const enrolledCourses = enrollments.
  map((e) => ({ enrollment: e, course: Courses.byId(e.courseId) })).
  filter((x) => x.course);

  const totalSpent = txs.reduce((a, t) => a + t.amount, 0);
  const completed = enrolledCourses.filter(
    (x) => progressFor(x.course, x.enrollment.completedTopicIds) === 100
  ).length;

  return (
    <>
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Welcome back
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Hi, {user.name.split(" ")[0]}.
        </h1>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<BookOpen className="size-4" />}
          label="Enrolled"
          value={String(enrolledCourses.length)} />
        
        <Stat
          icon={<Trophy className="size-4" />}
          label="Completed"
          value={String(completed)} />
        
        <Stat
          icon={<Receipt className="size-4" />}
          label="Total spent"
          value={`$${totalSpent}`} />
        
      </div>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Continue learning</h2>
          <Link to="/dashboard/courses" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        {enrolledCourses.length === 0 ?
        <EmptyCard
          title="No courses yet"
          body="Browse the catalog to find your first pathway."
          ctaHref="/courses"
          ctaLabel="Browse catalog" /> :


        <div className="grid gap-4 md:grid-cols-2">
            {enrolledCourses.slice(0, 4).map(({ course, enrollment }) => {
            const progress = progressFor(course, enrollment.completedTopicIds);
            return (
              <Link
                key={course.id}
                to={`/learn/${course.slug}`}
                className="group rounded-2xl border border-foreground/5 bg-card p-5 transition-colors hover:border-glow/30">
                
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {course.category}
                  </div>
                  <div className="mb-4 font-semibold group-hover:text-glow">
                    {course.title}
                  </div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{progress}% complete</span>
                    <span className="text-muted-foreground">
                      {enrollment.completedTopicIds.length} /{" "}
                      {course.modules.reduce((a, m) => a + m.topics.length, 0)} topics
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                    className="h-full rounded-full bg-glow transition-all"
                    style={{ width: `${progress}%` }} />
                  
                  </div>
                </Link>);

          })}
          </div>
        }
      </section>
    </>);

}

export function Stat({
  icon,
  label,
  value




}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-glow-soft text-glow">
        {icon}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>);

}

export function EmptyCard({
  title,
  body,
  ctaHref,
  ctaLabel





}) {
  return (
    <div className="rounded-3xl border border-dashed border-foreground/10 p-10 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <Link
        to={ctaHref}
        className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">
        
        {ctaLabel}
      </Link>
    </div>);

}