import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../lib/auth-context.jsx";

import {
  Award,
  BarChart3,
  BookOpen,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  Receipt,
  Settings,
  ShieldCheck,
  UserCog } from
"lucide-react";







const navByRole = {
  student: [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { to: "/dashboard/courses", label: "My courses", icon: <BookOpen className="size-4" /> },
  { to: "/dashboard/certificates", label: "Certificates", icon: <Award className="size-4" /> },
  { to: "/dashboard/wishlist", label: "Wishlist", icon: <Heart className="size-4" /> },
  { to: "/dashboard/payments", label: "Payments", icon: <Receipt className="size-4" /> }],

  instructor: [
  { to: "/instructor", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { to: "/instructor/courses", label: "My courses", icon: <GraduationCap className="size-4" /> },
  { to: "/instructor/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { to: "/instructor/new", label: "New course", icon: <PlusSquare className="size-4" /> }],

  admin: [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { to: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { to: "/admin/students", label: "Students", icon: <GraduationCap className="size-4" /> },
  { to: "/admin/courses", label: "Courses", icon: <BookOpen className="size-4" /> },
  { to: "/admin/payments", label: "Payments", icon: <Receipt className="size-4" /> },
  { to: "/admin/certificates", label: "Certificates", icon: <Award className="size-4" /> },
  { to: "/admin/users", label: "Users", icon: <UserCog className="size-4" /> },
  { to: "/admin/settings", label: "Settings", icon: <Settings className="size-4" /> }]

};

export function DashboardShell({
  children,
  requireRole



}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];

  useEffect(() => {
    if (!user) {
      navigate(`/login`);
    } else if (!allowed.includes(user.role)) {
      const target =
        user.role === "admin"
          ? "/admin"
          : user.role === "instructor"
          ? "/instructor"
          : "/dashboard";
      navigate(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>);

  }

  const links = navByRole[user.role];
  const roleLabel = {
    student: "Student",
    instructor: "Instructor",
    admin: "Administrator"
  }[user.role];

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <aside className="sticky top-8 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col rounded-2xl border border-foreground/5 bg-sidebar p-5 lg:flex">
          <Link to="/" className="mb-8 text-lg font-bold tracking-tight">
            Lumen<span className="text-glow">.</span>
          </Link>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            {roleLabel}
          </div>
          <div className="mb-6 truncate text-sm font-medium text-foreground">{user.name}</div>
          <nav className="flex flex-1 flex-col gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ?
                  "bg-foreground text-background" :
                  "text-foreground/70 hover:bg-secondary hover:text-foreground"}`
                  }>
                  
                  {l.icon}
                  {l.label}
                </Link>);

            })}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate(`/`);
            }}
            className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            
            <LogOut className="size-4" />
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          {/* mobile top bar */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="text-lg font-bold">
              Lumen<span className="text-glow">.</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate(`/`);
              }}
              className="text-sm text-muted-foreground">
              
              Sign out
            </button>
          </div>
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-foreground/5 bg-sidebar p-1 lg:hidden">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  active ? "bg-foreground text-background" : "text-foreground/70"}`
                  }>
                  
                  {l.label}
                </Link>);

            })}
          </div>
          {children}
        </main>
      </div>
    </div>);

}