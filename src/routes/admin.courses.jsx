import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { Courses, Enrollments } from "../lib/store.js";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/courses",
  fullPath: "/admin/courses",
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
  useEffect(() => { document.title = "Courses — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const [, force] = useState(0);
  const list = Courses.all();

  const onDelete = (id) => {
    if (!confirm("Delete this course?")) return;
    Courses.remove(id);
    toast.success("Course deleted");
    force((x) => x + 1);
  };

  return (
    <>
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
        <Link
          to="/instructor/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">
          + New course
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
        {list.map((c) =>
        <div
          key={c.id}
          className="flex items-center justify-between border-b border-foreground/5 p-5 last:border-b-0">
          
            <div className="min-w-0">
              <Link
              to={`/admin/courses/${c.id}`}
              className="block truncate font-medium hover:text-glow">
              
                {c.title}
              </Link>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {c.instructorName} · {c.category} · {Enrollments.forCourse(c.id).length}{" "}
                students
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/courses/${c.id}`}
                className="rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                Analytics
              </Link>
              <Link
                to={`/admin/courses/${c.id}`}
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
    </>);

}