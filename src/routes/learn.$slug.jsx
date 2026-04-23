import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useMemo, useState } from "react";
import { Courses, Enrollments, QuizAttempts, flatTopics, progressFor } from "../lib/store.js";

import { useAuth } from "../lib/auth-context.jsx";
import { QuizPlayer } from "../components/quiz-player.jsx";
import { Certificates } from "../lib/certificates.js";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  PlayCircle } from
"lucide-react";
import { toast } from "sonner";


export const Route = {
  path: "/learn/$slug",
  fullPath: "/learn/$slug",
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
  useEffect(() => { document.title = "Learning: ${params.slug} — EduVibe"; }, []);
  return <LearnPage />;
}


function LearnPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    setCourse(Courses.bySlug(slug) ?? null);
    setResolved(true);
  }, [slug]);

  useEffect(() => {
    if (resolved && !user) navigate(`/login`);
  }, [resolved, user, navigate]);

  const enrollment = user && course ? Enrollments.get(user.id, course.id) : undefined;
  useEffect(() => {
    if (user && course && !enrollment) {
      if (user.role !== "student") {
        navigate(`/courses/${course.slug}`);
        return;
      }
      if (course.price === 0) {
        Enrollments.enroll(user.id, course.id);
        force((x) => x + 1);
      } else {
        navigate(`/courses/${course.slug}`);
      }
    }
  }, [user, course, enrollment, navigate]);

  const all = useMemo(() => course ? flatTopics(course) : [], [course]);
  const completed = enrollment?.completedTopicIds ?? [];
  const progress = enrollment && course ? progressFor(course, completed) : 0;

  const startId = enrollment?.lastTopicId ?? all[0]?.topic.id;
  const [activeId, setActiveId] = useState(undefined);
  useEffect(() => {
    setActiveId(startId);
  }, [startId]);

  if (!resolved || !course || !user || !enrollment) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        Loading your lesson workspace…
      </div>);

  }

  const idx = all.findIndex((t) => t.topic.id === activeId);
  const current = all[idx] ?? all[0];
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const lessonIndex = idx >= 0 ? idx + 1 : 1;
  const moduleIndex = course.modules.findIndex((m) => m.id === current.module.id) + 1;
  const completedCurrent = completed.includes(current.topic.id);
  const videoHref = current.topic.videoId ?
  `https://www.youtube.com/watch?v=${current.topic.videoId}` :
  undefined;
  const lessonWorkflow = [
  current.topic.type === "video" ?
  "Watch the embedded lesson, then use the notes below to lock in the key idea." :
  current.topic.type === "reading" ?
  "Read the lesson closely and pull out the idea you want to apply immediately." :
  "Use this checkpoint to test recall before moving on.",
  `This lesson belongs to ${current.module.title} and counts toward your overall course progress.`,
  next ?
  `When you're ready, continue to ${next.topic.title}.` :
  "This is the final lesson in the track — mark it complete to finish strong."];


  const setActive = (id) => {
    setActiveId(id);
    Enrollments.setLast(user.id, course.id, id);
    force((x) => x + 1);
  };

  const maybeIssueCertificate = () => {
    const fresh = Enrollments.get(user.id, course.id);
    if (!fresh) return;
    if (progressFor(course, fresh.completedTopicIds) !== 100) return;
    if (Certificates.get(user.id, course.id)) return;
    // Average best quiz score across course quiz topics; default 100 if no quizzes.
    const quizTopicIds = course.modules.flatMap((m) =>
    m.topics.filter((t) => t.type === "quiz").map((t) => t.id)
    );
    let score = 100;
    if (quizTopicIds.length) {
      const bests = quizTopicIds.map((tid) => QuizAttempts.best(user.id, tid)?.score ?? 0);
      score = Math.round(bests.reduce((a, b) => a + b, 0) / bests.length);
    }
    const cert = Certificates.issueIfEligible(user.id, course.id, score);
    if (cert) {
      toast.success("🎓 Certificate unlocked! View it in your dashboard.", { duration: 5000 });
    }
  };

  const toggle = (id) => {
    Enrollments.toggleTopic(user.id, course.id, id);
    force((x) => x + 1);
    if (!completed.includes(id)) toast.success("Topic marked complete");
    maybeIssueCertificate();
  };

  const renderLessonSurface = () => {
    if (current.topic.type === "video" && current.topic.videoId) {
      return (
        <div className="overflow-hidden rounded-[28px] border border-foreground/5 bg-card shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <div className="relative aspect-video bg-black">
            <iframe
              key={current.topic.id}
              src={`https://www.youtube.com/embed/${current.topic.videoId}?rel=0&modestbranding=1&playsinline=1`}
              title={current.topic.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0" />
            
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/5 px-5 py-4 text-sm text-muted-foreground sm:px-6">
            <div className="flex items-center gap-2">
              <PlayCircle className="size-4 text-glow" />
              Video lesson · {current.topic.duration}
            </div>
            {videoHref &&
            <a
              href={videoHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 text-foreground transition-colors hover:bg-secondary">
              
                Open on YouTube <ExternalLink className="size-4" />
              </a>
            }
          </div>
        </div>);

    }

    if (current.topic.type === "reading") {
      return (
        <div className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-8">
          <div className="mb-5 flex items-center gap-3 text-sm font-medium text-foreground">
            <BookOpen className="size-5 text-glow" />
            Reading lesson · {current.topic.duration}
          </div>
          <div className="rounded-2xl bg-secondary/60 p-6 leading-relaxed text-muted-foreground">
            {current.topic.content}
          </div>
        </div>);

    }

    return (
      <QuizPlayer
        topic={current.topic}
        userId={user.id}
        courseId={course.id}
        alreadyCompleted={completedCurrent}
        onPassed={() => {
          if (!completed.includes(current.topic.id)) {
            Enrollments.toggleTopic(user.id, course.id, current.topic.id);
            force((x) => x + 1);
          }
          maybeIssueCertificate();
        }}
        onAttempt={() => force((x) => x + 1)} />);


  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            to={`/courses/${course.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            
            <ArrowLeft className="size-4" /> Back
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-sm font-semibold">{course.title}</div>
            <div className="text-xs text-muted-foreground">{progress}% complete</div>
          </div>
          <div className="hidden text-sm text-muted-foreground sm:block">{user.name}</div>
        </div>
        <div className="h-1 w-full bg-secondary">
          <div
            className="h-full bg-glow transition-all"
            style={{ width: `${progress}%` }} />
          
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:px-10">
        <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto">
          <div className="rounded-2xl border border-foreground/5 bg-card p-2">
            {course.modules.map((m, i) =>
            <div key={m.id} className="mb-2 last:mb-0">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Module {i + 1} · {m.title}
                </div>
                <ul>
                  {m.topics.map((t) => {
                  const done = completed.includes(t.id);
                  const active = t.id === activeId;
                  return (
                    <li key={t.id}>
                        <button
                        onClick={() => setActive(t.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active ?
                        "bg-foreground text-background" :
                        "text-foreground/80 hover:bg-secondary"}`
                        }>
                        
                          {done ?
                        <CheckCircle2 className="size-4 shrink-0 text-glow" /> :

                        <Circle className="size-4 shrink-0 opacity-40" />
                        }
                          <span className="min-w-0 flex-1 truncate">{t.title}</span>
                          <span
                          className={`text-xs tabular-nums ${active ? "text-background/60" : "text-muted-foreground"}`}>
                          
                            {t.duration}
                          </span>
                        </button>
                      </li>);

                })}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          {current &&
          <>
              <section className="rounded-[28px] border border-foreground/5 bg-card/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span>Module {moduleIndex}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span>Lesson {lessonIndex} of {all.length}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span>{current.topic.type}</span>
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                  {lessonIndex}. {current.topic.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full bg-secondary px-3 py-1">{current.module.title}</span>
                  <span className="rounded-full bg-secondary px-3 py-1">{current.topic.duration}</span>
                  <span className="rounded-full bg-secondary px-3 py-1">{completed.length}/{all.length} completed</span>
                </div>
              </section>

              {renderLessonSurface()}

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_320px]">
                <section className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-8">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Lesson notes
                  </div>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {current.topic.content}
                  </p>
                </section>

                <aside className="space-y-6">
                  <section className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Lesson workflow
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {lessonWorkflow.map((item) =>
                    <li key={item} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-glow" />
                          <span>{item}</span>
                        </li>
                    )}
                    </ul>
                  </section>

                  {next &&
                <section className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Next up
                      </div>
                      <div className="text-lg font-semibold tracking-tight">{next.topic.title}</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {next.module.title} · {next.topic.duration}
                      </p>
                      <button
                    onClick={() => setActive(next.topic.id)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                    
                        Continue <ArrowRight className="size-4" />
                      </button>
                    </section>
                }
                </aside>
              </div>

              <div className="flex flex-col gap-4 rounded-[28px] border border-foreground/5 bg-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
                {current.topic.type === "quiz" ?
              <div className="text-sm text-muted-foreground">
                    {completedCurrent ?
                "Quiz passed — you can retake it any time." :
                "Pass the quiz above to mark this lesson complete."}
                  </div> :

              <button
                onClick={() => toggle(current.topic.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                completedCurrent ?
                "border border-foreground/10 bg-card text-foreground hover:bg-secondary" :
                "bg-foreground text-background hover:bg-foreground/90"}`
                }>
                
                    {completedCurrent ?
                <>
                        <CheckCircle2 className="size-4" /> Completed
                      </> :

                <>Mark as complete</>
                }
                  </button>
              }
                <div className="flex gap-2">
                  <button
                  disabled={!prev}
                  onClick={() => prev && setActive(prev.topic.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2.5 text-sm font-medium disabled:opacity-40">
                  
                    <ArrowLeft className="size-4" /> Previous
                  </button>
                  <button
                  disabled={!next}
                  onClick={() => next && setActive(next.topic.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-40">
                  
                    Next <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </>
          }
        </main>
      </div>
    </div>);

}