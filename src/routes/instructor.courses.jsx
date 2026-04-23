import { Link, useLocation, useParams } from "react-router-dom";import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments } from "../lib/store.js";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="instructor">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/instructor/courses",
  fullPath: "/instructor/courses",
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
  useEffect(() => { document.title = "My courses — Instructor — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  const [, force] = useState(0);
  if (!user) return null;
  const list = Courses.byInstructor(user.id);

  const onDelete = (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    Courses.remove(id);
    toast.success("Course deleted");
    force((x) => x + 1);
  };

  return (
    <>
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">My courses</h1>
        <Link
          to="/instructor/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">
          
          + New
        </Link>
      </div>

      {list.length === 0 ?
      <p className="text-sm text-muted-foreground">No courses yet.</p> :

      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          {list.map((c) =>
        <div
          key={c.id}
          className="flex items-center justify-between border-b border-foreground/5 p-5 last:border-b-0">
          
              <div className="min-w-0">
                <Link
              to={`/courses/${c.slug}`}
              className="block truncate font-medium hover:text-glow">
              
                  {c.title}
                </Link>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {c.category} · {c.level} · {Enrollments.forCourse(c.id).length} students
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Link
                  to={`/instructor/courses/${c.id}`}
                  className="rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(c.id)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
        )}
        </div>
      }
    </>);

}