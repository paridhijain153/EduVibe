import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { CourseEditor } from "../components/course-editor.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses } from "../lib/store.js";
import { CATEGORIES } from "../lib/mock-data.js";
import { Field } from "./login";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

function _PageInline() {
  return (
    <DashboardShell requireRole={["instructor", "admin"]}>
      <Inner />
    </DashboardShell>
  );
}

export const Route = {
  path: "/instructor/new",
  fullPath: "/instructor/new",
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
    document.title = "New course — Lumen";
  }, []);
  return <_PageInline />;
}

const THUMBS = [
  "from-amber-400 to-rose-500",
  "from-orange-400 to-amber-300",
  "from-yellow-400 to-orange-500",
  "from-rose-300 to-amber-400",
  "from-orange-500 to-rose-600",
];

function Inner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState("Foundational");
  const [price, setPrice] = useState("0");
  const [thumb, setThumb] = useState(THUMBS[0]);

  const slugPreview = useMemo(
    () =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    [title]
  );

  const [modules, setModules] = useState([
    {
      id: `m-${Math.random().toString(36).slice(2, 7)}`,
      title: "Module 1: Introduction",
      topics: [
        {
          id: `t-${Math.random().toString(36).slice(2, 7)}`,
          title: "1. Welcome",
          duration: "05:00",
          type: "video",
          content: "Welcome to your new course. Replace this content.",
        },
      ],
    },
  ]);

  if (!user) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!title || !subtitle)
      return toast.error("Please add a title and subtitle.");
    if (modules.length === 0)
      return toast.error("Add at least one module.");
    const slug =
      (slugPreview || "course") +
      "-" +
      Math.random().toString(36).slice(2, 6);
    const course = {
      id: `c-${Math.random().toString(36).slice(2, 9)}`,
      slug,
      title,
      subtitle,
      description: description || subtitle,
      category,
      level,
      price: Math.max(0, Number(price) || 0),
      thumbnail: thumb,
      instructorId: user.id,
      instructorName: user.name,
      rating: 0,
      ratingCount: 0,
      enrolledCount: 0,
      durationHours: 0,
      modules,
      reviews: [],
      createdAt: new Date().toISOString(),
    };
    Courses.upsert(course);
    toast.success("Course created");
    navigate(
      user.role === "admin"
        ? `/admin/courses/${course.id}`
        : `/instructor/courses/${course.id}`
    );
  };

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        Create a new course
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Fill in the details and build your curriculum below.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-5 rounded-2xl border border-foreground/5 bg-card p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Course details
          </div>
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-glow/20"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Level
              </span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm"
              >
                <option>Foundational</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <Field
              label="Price (USD)"
              type="number"
              value={price}
              onChange={setPrice}
            />
          </div>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thumbnail
            </span>
            <div className="flex flex-wrap gap-3">
              {THUMBS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setThumb(t)}
                  className={`h-14 w-20 rounded-xl bg-gradient-to-br ring-offset-2 ring-offset-card transition-shadow ${t} ${
                    thumb === t ? "ring-2 ring-glow" : ""
                  }`}
                  aria-label="Select thumbnail"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/5 bg-card p-6 sm:p-8">
          <CourseEditor
            value={modules}
            onChange={setModules}
            hideSave
          />
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/instructor/courses"
            className="rounded-full border border-foreground/10 px-5 py-3 text-sm font-medium hover:bg-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Create course
          </button>
        </div>
      </form>
    </>
  );
}
