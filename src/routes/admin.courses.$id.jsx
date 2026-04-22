import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { CourseCohortView } from "../components/course-cohort-view.jsx";
import { CourseEditor } from "../components/course-editor.jsx";
import { Courses } from "../lib/store.js";
import { ArrowLeft, BarChart3, PencilLine } from "lucide-react";

function _PageInline() {
  return (
    <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>
  );
}

export const Route = {
  path: "/admin/courses/$id",
  fullPath: "/admin/courses/$id",
  useParams: () => useParams(),
  useSearch: () => {
    const _loc = useLocation();
    const _sp = new URLSearchParams(_loc.search);
    const _o = {};
    _sp.forEach((v, k) => {
      _o[k] = v;
    });
    return _o;
  },
};

export default function _Page() {
  useEffect(() => {
    document.title = "Course — Admin — EduVibe";
  }, []);
  return <_PageInline />;
}

function Inner() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [tab, setTab] = useState("analytics");

  useEffect(() => {
    setCourse(Courses.byId(id) ?? null);
    setResolved(true);
  }, [id]);

  if (!resolved)
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!course) {
    return (
      <div className="rounded-3xl border border-dashed border-foreground/10 p-12 text-center">
        <p className="text-sm text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate(`/admin/courses`)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </button>

      <div className="mb-6 flex gap-2 rounded-full border border-foreground/10 bg-card p-1 w-fit">
        <TabButton
          active={tab === "analytics"}
          onClick={() => setTab("analytics")}
        >
          <BarChart3 className="size-3.5" /> Analytics
        </TabButton>
        <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
          <PencilLine className="size-3.5" /> Edit content
        </TabButton>
      </div>

      {tab === "analytics" ? (
        <CourseCohortView course={course} studentLinkBase="admin" />
      ) : (
        <CourseEditor
          course={course}
          onSave={(updated) => setCourse(updated)}
        />
      )}
    </>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
