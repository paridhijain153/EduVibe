import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { CourseCard } from "../components/course-card.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Wishlist } from "../lib/store.js";
import { EmptyCard } from "./dashboard.index";


function _PageInline() {
  return (
  <DashboardShell requireRole="student">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/dashboard/wishlist",
  fullPath: "/dashboard/wishlist",
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
  useEffect(() => { document.title = "Wishlist — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  if (!user) return null;
  const ids = Wishlist.all(user.id);
  const courses = ids.map((id) => Courses.byId(id)).filter((c) => !!c);

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Wishlist</h1>
      {courses.length === 0 ?
      <EmptyCard
        title="Your wishlist is empty"
        body="Save courses you want to study later."
        ctaHref="/courses"
        ctaLabel="Browse catalog" /> :


      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) =>
        <CourseCard key={c.id} course={c} />
        )}
        </div>
      }
    </>);

}