import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "../components/site-chrome.jsx";
import { CourseCard } from "../components/course-card.jsx";
import { Courses } from "../lib/store.js";
import { ArrowRight, BookOpen, Sparkles, Trophy, Users } from "lucide-react";



function _qs(o) {
  if (!o) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? "?" + s : "";
}

export const Route = {
  path: "/",
  fullPath: "/",
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
  useEffect(() => { document.title = "Learn Anything Anywhere"; }, []);
  return <HomePage />;
}


function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const featured = Courses.all().slice(0, 3);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] -z-0 h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-glow/10 blur-[140px]" />
      <SiteHeader />

      {/* HERO */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-24 text-center sm:px-8 sm:pt-36">

        <h1 className="mb-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          Learn Anything{" "}
          <span className="bg-gradient-to-r from-foreground to-glow/80 bg-clip-text text-transparent">
            Anywhere
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Expert-led courses designed for real-world success.
        </p>

        <form
          className="group relative w-full max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/courses` + _qs(query ? { q: query } : undefined));
          }}>
          
          <div className="absolute inset-0 rounded-full bg-glow/20 opacity-0 blur-2xl transition-opacity duration-500 group-focus-within:opacity-100" />
          <div className="relative flex items-center rounded-full border border-foreground/10 bg-card p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-foreground/0 transition-all duration-300 focus-within:border-glow/30 focus-within:ring-glow/30">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="What domain will you explore today?"
              className="min-w-0 w-full border-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-0 sm:px-6" />
            
            <button
              type="submit"
              className="shrink-0 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/90 sm:px-8 sm:py-3.5">
              
              Search
            </button>
          </div>
        </form>

        <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-10">
          {[
          { v: "120+", l: "Courses" },
          { v: "40k", l: "Learners" },
          { v: "4.8", l: "Avg rating" }].
          map((s) =>
          <div key={s.l}>
              <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.v}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">
                {s.l}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FEATURED COURSES */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Curated pathways</h2>
          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            
            View entire catalog →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((c) =>
          <CourseCard key={c.id} course={c} />
          )}
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="border-t border-foreground/5 bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Built for serious learning
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Every detail considered. <br />
              From first lesson to final certificate.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
            {
              icon: <BookOpen className="size-5" />,
              title: "Structured pathways",
              copy: "Modules, topics and assessments laid out so you always know what's next."
            },
            {
              icon: <Trophy className="size-5" />,
              title: "Track every step",
              copy: "Resume where you left off. Watch your progress quietly accumulate."
            },
            {
              icon: <Users className="size-5" />,
              title: "Learn from practitioners",
              copy: "Mentors who ship, write and teach — not generic content factories."
            },
            {
              icon: <Sparkles className="size-5" />,
              title: "Calm by design",
              copy: "An interface that gets out of the way so the material can speak."
            }].
            map((f) =>
            <div
              key={f.title}
              className="rounded-2xl border border-foreground/5 bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              
                <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-glow-soft text-glow">
                  {f.icon}
                </div>
                <div className="mb-1.5 text-base font-semibold">{f.title}</div>
                <p className="text-sm text-muted-foreground">{f.copy}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>);

}