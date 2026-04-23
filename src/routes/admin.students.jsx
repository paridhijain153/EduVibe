import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { buildStudentRows, loadAdminSnapshot } from "../lib/analytics.js";
import { ChevronRight, Search } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <StudentsPage />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/students",
  fullPath: "/admin/students",
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
  useEffect(() => { document.title = "Students — Admin — EduVibe"; }, []);
  return <_PageInline />;
}




function StudentsPage() {
  const [snap, setSnap] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("lastActivity");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setSnap(loadAdminSnapshot());
  }, []);

  const rows = useMemo(() => {
    if (!snap) return [];
    let r = buildStudentRows(snap);
    if (filter === "active") r = r.filter((x) => x.enrolledCount > 0);
    if (filter === "inactive") r = r.filter((x) => x.enrolledCount === 0);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) => x.user.name.toLowerCase().includes(q) || x.user.email.toLowerCase().includes(q)
      );
    }
    r.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.user.name.localeCompare(b.user.name);
        case "enrolled":
          return b.enrolledCount - a.enrolledCount;
        case "progress":
          return b.averageProgress - a.averageProgress;
        case "quizPass":
          return b.quizPassRate - a.quizPassRate;
        case "spent":
          return b.spent - a.spent;
        case "lastActivity":
        default:
          return (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "");
      }
    });
    return r;
  }, [snap, query, sort, filter]);

  if (!snap) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Learners
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Students
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length} of {snap.students.length} students shown
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-full border border-foreground/10 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground/30" />
          
        </div>
        <div className="inline-flex rounded-full border border-foreground/10 bg-card p-1 text-xs font-medium">
          {["all", "active", "inactive"].map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
            filter === f ?
            "bg-foreground text-background" :
            "text-muted-foreground hover:text-foreground"}`
            }>
            
              {f}
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm">
          
          <option value="lastActivity">Sort: Recent activity</option>
          <option value="name">Sort: Name</option>
          <option value="enrolled">Sort: Enrolled</option>
          <option value="progress">Sort: Progress</option>
          <option value="quizPass">Sort: Quiz pass rate</option>
          <option value="spent">Sort: Spent</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-foreground/5 bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-foreground/5 bg-secondary/30 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Student</th>
              <th className="px-5 py-3 text-right">Enrolled</th>
              <th className="px-5 py-3 text-right">Completed</th>
              <th className="px-5 py-3 text-left">Avg. progress</th>
              <th className="px-5 py-3 text-right">Quiz pass</th>
              <th className="px-5 py-3 text-right">Spent</th>
              <th className="px-5 py-3 text-right">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
            <tr
              key={r.user.id}
              className="border-b border-foreground/5 last:border-b-0 hover:bg-secondary/30">
              
                <td className="px-5 py-3">
                  <Link
                  to={`/admin/students/${r.user.id}`}
                  className="flex items-center gap-3 hover:opacity-80">
                  
                    <div
                    className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: r.user.avatarColor }}>
                    
                      {r.user.name.
                    split(" ").
                    map((n) => n[0]).
                    slice(0, 2).
                    join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.user.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {r.user.email}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{r.enrolledCount}</td>
                <td className="px-5 py-3 text-right tabular-nums">{r.completedCount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                      <div
                      className="h-full bg-glow"
                      style={{ width: `${r.averageProgress}%` }} />
                    
                    </div>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {r.averageProgress}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {r.quizAttempts ? `${r.quizPassRate}%` : "—"}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">${r.spent}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                  to={`/admin/students/${r.user.id}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  
                    {r.lastActivity ?
                  new Date(r.lastActivity).toLocaleDateString() :
                  "—"}
                    <ChevronRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            )}
            {rows.length === 0 &&
            <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No students match your filters.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </>);

}