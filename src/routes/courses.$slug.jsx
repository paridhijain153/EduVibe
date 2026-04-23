import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { SiteHeader, SiteFooter } from "../components/site-chrome.jsx";

import { Courses, Enrollments, Wishlist, progressFor } from "../lib/store.js";
import { ratingStats } from "../lib/reviews.js";
import { CourseReviews } from "../components/course-reviews.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Heart,
  PlayCircle,
  Sparkles,
  Star,
  Users as UsersIcon } from
"lucide-react";


export const Route = {
  path: "/courses/$slug",
  fullPath: "/courses/$slug",
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
  useEffect(() => { document.title = "${params.slug} — EduVibe"; }, []);
  return <CourseDetail />;
}


function CourseDetail() {
  const { slug } = Route.useParams();
  const [course, setCourse] = useState(null);
  const [resolved, setResolved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null);
  const [, force] = useState(0);

  useEffect(() => {
    const c = Courses.bySlug(slug) ?? null;
    setCourse(c);
    setOpenModule(c?.modules[0]?.id ?? null);
    setResolved(true);
  }, [slug]);

  const totalTopics = course?.modules.reduce((a, m) => a + m.topics.length, 0) ?? 0;
  const lessonPreview = useMemo(
    () =>
    course ? course.modules.flatMap((module) => module.topics.map((topic) => ({ module, topic }))) : [],
    [course]
  );

  if (!resolved) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>);

  }

  if (!course) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="text-3xl font-semibold">Course not found</h1>
          <Link to="/courses" className="mt-6 inline-block text-glow hover:underline">
            Back to catalog →
          </Link>
        </div>
      </div>);

  }

  const enrollment = user ? Enrollments.get(user.id, course.id) : undefined;
  const isEnrolled = !!enrollment;
  const inWishlist = user ? Wishlist.all(user.id).includes(course.id) : false;
  const progress = enrollment ? progressFor(course, enrollment.completedTopicIds) : 0;
  const firstLesson = lessonPreview[0];
  const experienceCards = [
  {
    title: `${course.modules.length} structured modules`,
    detail: `${totalTopics} lessons sequenced from first principles to applied practice.`,
    icon: BookOpen
  },
  {
    title: `${course.durationHours.toFixed(1)} hours, self-paced`,
    detail: `Dip in for a single session or move through the whole ${course.level.toLowerCase()} track over a weekend.`,
    icon: Clock3
  },
  {
    title: "Completion certificate",
    detail: "Finish the lessons and quizzes to earn a shareable proof-of-completion credential.",
    icon: Award
  }];


  const handleEnroll = () => {
    if (!user) {
      toast.info("Sign in to enroll");
      navigate(`/login`);
      return;
    }
    if (user.role !== "student") {
      toast.error("Only students can enroll in courses. Sign in with a student account.");
      return;
    }
    if (course.price > 0) {
      navigate(`/checkout/${course.slug}`);
      return;
    }
    Enrollments.enroll(user.id, course.id);
    toast.success("You're enrolled!");
    navigate(`/learn/${course.slug}`);
  };

  const toggleWishlist = () => {
    if (!user) {
      navigate(`/login`);
      return;
    }
    if (user.role !== "student") {
      toast.error("Only students can use the wishlist.");
      return;
    }
    Wishlist.toggle(user.id, course.id);
    force((x) => x + 1);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const openLesson = (topicId) => {
    if (!user || !isEnrolled) return;
    Enrollments.setLast(user.id, course.id, topicId);
    navigate(`/learn/${course.slug}`);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <header className="border-b border-foreground/5 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Link to="/courses" className="hover:text-foreground">
                Catalog
              </Link>
              <span>/</span>
              <span>{course.category}</span>
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {course.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {(() => {
                const s = ratingStats(course);
                const avg = s.count === 0 ? course.rating : s.average;
                const count = s.count === 0 ? course.ratingCount : s.count;
                return (
                  <div className="flex items-center gap-1.5">
                    <Star className="size-4 fill-glow text-glow" />
                    <span className="font-semibold">{avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">({count})</span>
                  </div>);

              })()}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <UsersIcon className="size-4" />
                {course.enrolledCount.toLocaleString()} enrolled
              </div>
              <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                {course.level}
              </span>
            </div>
            <div className="mt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mentor
              </div>
              <div className="mt-2 text-base font-medium">{course.instructorName}</div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {experienceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-foreground/5 bg-background/80 p-5">
                    
                    <Icon className="size-5 text-glow" />
                    <div className="mt-4 text-base font-semibold tracking-tight">{card.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
                  </div>);

              })}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-foreground/5 bg-card shadow-[0_16px_60px_rgba(0,0,0,0.06)]">
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${course.thumbnail}`}>
                
                {course.image &&
                <img
                  src={course.image}
                  alt={course.title}
                  width={1024}
                  height={768}
                  className="absolute inset-0 h-full w-full object-cover" />

                }
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                  <PlayCircle className="size-16 opacity-90 drop-shadow-lg" strokeWidth={1.5} />
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <div className="text-3xl font-semibold tracking-tight">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                  {course.price > 0 &&
                  <div className="text-sm text-muted-foreground line-through">
                      ${course.price + 40}
                    </div>
                  }
                </div>

                {isEnrolled &&
                <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Your progress</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                      className="h-full rounded-full bg-glow transition-all"
                      style={{ width: `${progress}%` }} />
                    
                    </div>
                  </div>
                }

                {isEnrolled ?
                <Link
                  to={`/learn/${course.slug}`}
                  className="block w-full rounded-full bg-foreground py-3 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                  
                    Continue learning →
                  </Link> :

                <button
                  onClick={handleEnroll}
                  className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                  
                    {course.price === 0 ? "Enroll for free" : `Enroll · $${course.price}`}
                  </button>
                }
                <button
                  onClick={toggleWishlist}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-foreground/10 py-3 text-sm font-medium hover:bg-secondary">
                  
                  <Heart
                    className={`size-4 ${inWishlist ? "fill-glow text-glow" : ""}`} />
                  
                  {inWishlist ? "Saved" : "Save for later"}
                </button>

                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-glow" />
                    {course.modules.length} modules · {totalTopics} topics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-glow" />
                    {course.durationHours.toFixed(1)} hours of material
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="size-4 text-glow" />
                    Certificate on completion
                  </li>
                </ul>

                {firstLesson &&
                <div className="mt-6 rounded-2xl bg-secondary/70 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Starts with
                    </div>
                    <div className="mt-2 font-medium">{firstLesson.topic.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {firstLesson.module.title} · {firstLesson.topic.duration}
                    </p>
                  </div>
                }
              </div>
            </div>
          </aside>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <section className="mb-14">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">About this course</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </section>

          <section className="mb-14">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="size-5 text-glow" />
              <h2 className="text-2xl font-semibold tracking-tight">What you’ll cover</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {course.modules.map((module, index) =>
              <article
                key={module.id}
                className="rounded-2xl border border-foreground/5 bg-card p-5">
                
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Module {index + 1}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{module.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {module.topics.slice(0, 2).map((topic) => topic.title).join(" · ")}
                  </p>
                </article>
              )}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Curriculum</h2>
            <div className="overflow-hidden rounded-[28px] border border-foreground/5 bg-card">
              {course.modules.map((m, i) => {
                const open = openModule === m.id;
                return (
                  <div key={m.id} className="border-b border-foreground/5 last:border-b-0">
                    <button
                      onClick={() => setOpenModule(open ? null : m.id)}
                      className="flex w-full items-center justify-between gap-4 bg-card px-5 py-4 text-left transition-colors hover:bg-secondary/50">
                      
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Module {i + 1}
                        </div>
                        <div className="mt-0.5 font-medium">{m.title}</div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{m.topics.length} topics</span>
                        <ChevronDown
                          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        
                      </div>
                    </button>
                    {open &&
                    <ul className="bg-background/50 px-5 py-3">
                        {m.topics.map((t) =>
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-4 border-b border-foreground/5 py-3 last:border-b-0">
                        
                            <div className="flex items-center gap-3">
                              <PlayCircle className="size-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">{t.title}</div>
                                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  {t.type}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {t.duration}
                              </span>
                              {isEnrolled &&
                          <button
                            onClick={() => openLesson(t.id)}
                            className="rounded-full border border-foreground/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary">
                            
                                  Open
                                </button>
                          }
                            </div>
                          </li>
                      )}
                      </ul>
                    }
                  </div>);

              })}
            </div>
          </section>

          <CourseReviews course={course} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[28px] border border-foreground/5 bg-card p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mentor
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{course.instructorName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Teaching {course.category.toLowerCase()} through structured, practitioner-led lessons with a strong emphasis on applied thinking.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <UsersIcon className="size-4" /> {course.enrolledCount.toLocaleString()} learners in this cohort
            </div>
          </section>

          <section className="rounded-[28px] border border-foreground/5 bg-card p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Course format
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-glow" />
                Stream video, reading and quiz lessons from a single learning workspace.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-glow" />
                Resume exactly where you left off with saved topic progress.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-glow" />
                Work through every module at your own pace and revisit lessons anytime.
              </li>
            </ul>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </div>);

}