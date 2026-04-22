import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { Courses, Users } from "../lib/store.js";
import { Certificates, downloadCertificate } from "../lib/certificates.js";
import { Award, Download, Search } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/certificates",
  fullPath: "/admin/certificates",
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
  useEffect(() => { document.title = "Certificates — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const [certs, setCerts] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setCerts(Certificates.all());
  }, []);

  const enriched = certs.
  map((c) => ({
    cert: c,
    user: Users.byId(c.userId),
    course: Courses.byId(c.courseId)
  })).
  filter((r) => r.user && r.course);

  const filtered = enriched.filter((r) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      r.user.name.toLowerCase().includes(needle) ||
      r.user.email.toLowerCase().includes(needle) ||
      r.course.title.toLowerCase().includes(needle) ||
      r.cert.id.toLowerCase().includes(needle));

  });

  const avgScore = enriched.length ?
  Math.round(enriched.reduce((a, r) => a + r.cert.score, 0) / enriched.length) :
  0;
  const uniqueLearners = new Set(enriched.map((r) => r.user.id)).size;

  return (
    <>
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Issued credentials
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Certificates
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every EduVibe-issued completion certificate. Download a copy for verification or audit.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Tile label="Issued total" value={String(enriched.length)} />
        <Tile label="Unique learners" value={String(uniqueLearners)} />
        <Tile label="Average score" value={`${avgScore}%`} />
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-full border border-foreground/10 bg-card px-4 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by learner, course or certificate ID…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        
      </div>

      {filtered.length === 0 ?
      <div className="rounded-2xl border border-dashed border-foreground/10 p-10 text-center text-sm text-muted-foreground">
          {enriched.length === 0 ?
        "No certificates have been issued yet." :
        "No matches for this search."}
        </div> :

      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Learner</th>
                  <th className="px-5 py-3 text-left font-semibold">Course</th>
                  <th className="px-5 py-3 text-left font-semibold">Issued</th>
                  <th className="px-5 py-3 text-right font-semibold">Score</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ cert, user, course }) =>
              <tr key={cert.id} className="border-t border-foreground/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                      className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: user.avatarColor }}>
                      
                          {user.name.
                      split(" ").
                      map((n) => n[0]).
                      slice(0, 2).
                      join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="size-4 text-glow" />
                        <span className="font-medium">{course.title}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        ID {cert.id}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold">
                      {cert.score}%
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                    onClick={() => downloadCertificate(cert)}
                    className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                    
                        <Download className="size-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </>);

}

function Tile({ label, value }) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>);

}