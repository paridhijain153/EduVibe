
import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments } from "../lib/store.js";
import { EmptyCard, Stat } from "./dashboard.index";
import { BookOpen, DollarSign, Users } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="instructor">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/instructor/",
  fullPath: "/instructor/",
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
  useEffect(() => { document.title = "Instructor — Lumen"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  if (!user) return null;
  const myCourses = Courses.byInstructor(user.id);
  const enrollments = myCourses.flatMap((c) => Enrollments.forCourse(c.id));
  const earnings = myCourses.reduce(
    (a, c) => a + c.price * Enrollments.forCourse(c.id).length,
    0
  );

  return (
    <>
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Instructor studio
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          {user.name}
        </h1>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Stat icon={<BookOpen className="size-4" />} label="Courses" value={String(myCourses.length)} />
        <Stat icon={<Users className="size-4" />} label="Enrollments" value={String(enrollments.length)} />
        <Stat icon={<DollarSign className="size-4" />} label="Earnings" value={`$${earnings}`} />
      </div>

      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Your courses</h2>
        <Link
          to="/instructor/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">
          
          + New course
        </Link>
      </div>

      {myCourses.length === 0 ?
      <EmptyCard
        title="No courses yet"
        body="Create your first course to start teaching on Lumen."
        ctaHref="/instructor/new"
        ctaLabel="Create course" /> :


      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          {myCourses.map((c) => {
          const enrolls = Enrollments.forCourse(c.id);
          return (
            <Link
              key={c.id}
              to={`/courses/${c.slug}`}
              className="flex items-center justify-between border-b border-foreground/5 p-5 last:border-b-0 hover:bg-secondary/30">
              
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {c.category} · {c.level}
                  </div>
                  <div className="mt-1 truncate font-medium">{c.title}</div>
                </div>
                <div className="ml-6 flex items-center gap-6 text-sm tabular-nums">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Students</div>
                    <div className="font-semibold">{enrolls.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-semibold">{c.price === 0 ? "Free" : `$${c.price}`}</div>
                  </div>
                </div>
              </Link>);

        })}
        </div>
      }
    </>);

}