import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Enrollments, progressFor } from "../lib/store.js";
import { Certificates, downloadCertificate } from "../lib/certificates.js";
import { Award, Download, Lock } from "lucide-react";
import { EmptyCard } from "./dashboard.index";


function _PageInline() {
  return (
  <DashboardShell requireRole="student">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/dashboard/certificates",
  fullPath: "/dashboard/certificates",
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
  useEffect(() => { document.title = "Certificates — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  const [, force] = useState(0);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (user) setCerts(Certificates.forUser(user.id));
  }, [user]);

  if (!user) return null;

  const enrollments = Enrollments.forUser(user.id);
  const inProgress = enrollments.
  map((e) => ({ enrollment: e, course: Courses.byId(e.courseId) })).
  filter((x) => x.course && !certs.find((c) => c.courseId === x.course.id));

  return (
    <>
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Achievements
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your certificates
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Finish 100% of a course to unlock its completion certificate. Each one is
          digitally signed with a unique ID and downloadable as a PDF.
        </p>
      </div>

      {certs.length === 0 ?
      <EmptyCard
        title="No certificates yet"
        body="Complete a course to earn your first EduVibe certificate."
        ctaHref="/dashboard/courses"
        ctaLabel="View my courses" /> :


      <div className="mb-10 grid gap-4 md:grid-cols-2">
          {certs.map((cert) => {
          const course = Courses.byId(cert.courseId);
          if (!course) return null;
          return (
            <div
              key={cert.id}
              className="group relative overflow-hidden rounded-3xl border border-foreground/5 bg-card p-6">
              
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-glow via-glow/60 to-transparent" />
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-glow-soft text-glow">
                    <Award className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {course.category}
                    </div>
                    <div className="truncate text-base font-semibold">{course.title}</div>
                  </div>
                </div>
                <dl className="mb-5 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">Score</dt>
                    <dd className="mt-1 text-base font-semibold tabular-nums">{cert.score}%</dd>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">Issued</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">ID</dt>
                    <dd className="mt-1 truncate text-xs font-mono">{cert.id}</dd>
                  </div>
                </dl>
                <button
                onClick={() => downloadCertificate(cert)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">
                
                  <Download className="size-4" /> Download PDF
                </button>
              </div>);

        })}
        </div>
      }

      {inProgress.length > 0 &&
      <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            In progress
          </h2>
          <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
            {inProgress.map(({ course, enrollment }) => {
            const progress = progressFor(course, enrollment.completedTopicIds);
            return (
              <div
                key={course.id}
                className="flex flex-col gap-4 border-b border-foreground/5 p-5 last:border-b-0 sm:flex-row sm:items-center">
                
                  <Lock className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{course.title}</div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary sm:max-w-md">
                      <div
                      className="h-full rounded-full bg-glow"
                      style={{ width: `${progress}%` }} />
                    
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {progress}% complete · finish to unlock certificate
                    </div>
                  </div>
                  <Link
                  to={`/learn/${course.slug}`}
                  className="shrink-0 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
                  
                    Resume
                  </Link>
                </div>);

          })}
          </div>
        </section>
      }

      {/* Hidden refresh trigger for force re-render in case of side effects */}
      <button hidden onClick={() => force((x) => x + 1)} />
    </>);

}