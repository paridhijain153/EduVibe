import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";import { SiteHeader, SiteFooter } from "../components/site-chrome.jsx";
import { Courses, Users } from "../lib/store.js";


export const Route = {
  path: "/instructors",
  fullPath: "/instructors",
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
  useEffect(() => { document.title = "Mentors — Lumen"; }, []);
  return <InstructorsPage />;
}


function InstructorsPage() {
  const instructors = Users.all().filter((u) => u.role === "instructor");
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <header className="mb-14 max-w-2xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Mentors
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Practitioners who write, ship, and teach.
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((i) => {
            const taught = Courses.byInstructor(i.id);
            return (
              <div
                key={i.id}
                className="rounded-2xl border border-foreground/5 bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                
                <div
                  className="mb-5 flex size-14 items-center justify-center rounded-full text-lg font-semibold text-white"
                  style={{ backgroundColor: i.avatarColor }}>
                  
                  {i.name.
                  split(" ").
                  map((n) => n[0]).
                  slice(0, 2).
                  join("")}
                </div>
                <h3 className="text-lg font-semibold">{i.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {taught.length} course{taught.length === 1 ? "" : "s"} ·{" "}
                  {taught.
                  reduce((a, c) => a + c.enrolledCount, 0).
                  toLocaleString()}{" "}
                  learners
                </p>
                <div className="mt-5 space-y-2">
                  {taught.map((c) =>
                  <Link
                    key={c.id}
                    to={`/courses/${c.slug}`}
                    className="block truncate text-sm text-foreground/80 hover:text-glow">
                    
                      → {c.title}
                    </Link>
                  )}
                </div>
              </div>);

          })}
        </div>
      </div>
      <SiteFooter />
    </div>);

}