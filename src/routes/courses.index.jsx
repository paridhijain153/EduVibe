import { useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Search, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "../components/site-chrome.jsx";
import { CourseCard } from "../components/course-card.jsx";
import { CATEGORIES } from "../lib/mock-data.js";
import { Courses } from "../lib/store.js";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  price: z.enum(["all", "free", "paid"]).optional(),
  level: z.string().optional()
});

const PAGE_SIZE = 9;



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
  path: "/courses/",
  fullPath: "/courses/",
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
  useEffect(() => { document.title = "Catalog — EduVibe"; }, []);
  return <CatalogPage />;
}


function CatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(search.q ?? "");
  const [courses, setCourses] = useState([]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setCourses(Courses.all());
    setResolved(true);
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (search.q) {
        const q = search.q.toLowerCase();
        if (
        !c.title.toLowerCase().includes(q) &&
        !c.subtitle.toLowerCase().includes(q) &&
        !c.instructorName.toLowerCase().includes(q) &&
        !c.category.toLowerCase().includes(q))
        {
          return false;
        }
      }
      if (search.category && c.category !== search.category) return false;
      if (search.level && c.level !== search.level) return false;
      if (search.price === "free" && c.price > 0) return false;
      if (search.price === "paid" && c.price === 0) return false;
      return true;
    });
  }, [courses, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const setSearch = (patch) => {
    setPage(1);
    navigate(`/courses` + _qs({ ...search, ...patch }));
  };

  const activeFilters = [
  search.category,
  search.level,
  search.price && search.price !== "all" ? search.price : undefined,
  search.q].
  filter(Boolean).length;

  if (!resolved) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-5 py-12 text-sm text-muted-foreground sm:px-8 sm:py-16">
          Loading courses…
        </div>
        <SiteFooter />
      </div>);

  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Catalog
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your next pathway.
          </h1>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ q: query || undefined });
          }}
          className="mb-6 flex items-center gap-2 rounded-full border border-foreground/10 bg-card p-1.5 shadow-sm">
          
          <Search className="ml-3 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, instructor, or keyword…"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/50" />
          
          {query &&
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSearch({ q: undefined });
            }}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            aria-label="Clear">
            
              <X className="size-4" />
            </button>
          }
          <button className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
            Search
          </button>
        </form>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <FilterSelect
            label="Category"
            value={search.category ?? ""}
            onChange={(v) => setSearch({ category: v || undefined })}
            options={["", ...CATEGORIES]} />
          
          <FilterSelect
            label="Level"
            value={search.level ?? ""}
            onChange={(v) => setSearch({ level: v || undefined })}
            options={["", "Foundational", "Intermediate", "Advanced"]} />
          
          <FilterSelect
            label="Price"
            value={search.price ?? "all"}
            onChange={(v) => setSearch({ price: v || undefined })}
            options={["all", "free", "paid"]}
            display={(v) => v === "all" ? "All prices" : v === "free" ? "Free" : "Paid"} />
          
        </div>

        <div className="mb-6 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{visible.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span> courses
            {activeFilters > 0 &&
            <button
              onClick={() => {
                setQuery("");
                navigate(`/courses`);
                setPage(1);
              }}
              className="ml-3 text-glow hover:underline">
              
                Clear filters
              </button>
            }
          </p>
        </div>

        {visible.length === 0 ?
        <div className="rounded-3xl border border-dashed border-foreground/10 p-16 text-center">
            <p className="text-lg font-medium">No courses match your filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try widening your search.</p>
          </div> :

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) =>
          <CourseCard key={c.id} course={c} />
          )}
          </div>
        }

        {hasMore &&
        <div className="mt-10 flex justify-center">
            <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-foreground/10 bg-card px-6 py-3 text-sm font-medium hover:bg-secondary">
            
              Load more
            </button>
          </div>
        }
      </div>
      <SiteFooter />
    </div>);

}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  display






}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-foreground/10 bg-card px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-glow focus:ring-2 focus:ring-glow/20">
        
        {options.map((o) =>
        <option key={o} value={o}>
            {display ? display(o) : o === "" ? `All ${label.toLowerCase()}s` : o}
          </option>
        )}
      </select>
    </label>);

}