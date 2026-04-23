import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments, progressFor } from "../lib/store.js";
import { EmptyCard } from "./dashboard.index";


function _PageInline() {
  return (
  <DashboardShell requireRole="student">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/dashboard/courses",
  fullPath: "/dashboard/courses",
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
  useEffect(() => { document.title = "My courses — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  if (!user) return null;
  const list = Enrollments.forUser(user.id).
  map((e) => ({ enrollment: e, course: Courses.byId(e.courseId) })).
  filter((x) => x.course);

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">My courses</h1>
      {list.length === 0 ?
      <EmptyCard
        title="No enrollments yet"
        body="Find a course to start your first pathway."
        ctaHref="/courses"
        ctaLabel="Browse catalog" /> :


      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          {list.map(({ course, enrollment }) => {
          const progress = progressFor(course, enrollment.completedTopicIds);
          return (
            <div
              key={course.id}
              className="flex flex-col gap-4 border-b border-foreground/5 p-5 last:border-b-0 sm:flex-row sm:items-center">
              
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {course.category}
                  </div>
                  <div className="mt-1 font-medium">{course.title}</div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary sm:max-w-md">
                    <div
                    className="h-full rounded-full bg-glow"
                    style={{ width: `${progress}%` }} />
                  
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{progress}% complete</div>
                </div>
                <Link
                to={`/learn/${course.slug}`}
                className="shrink-0 self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 sm:self-center">
                
                  {progress === 0 ? "Start" : "Resume"}
                </Link>
              </div>);

        })}
        </div>
      }
    </>);

}