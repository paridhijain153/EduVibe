import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context.jsx";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashHref =
  user?.role === "admin" ?
  "/admin" :
  user?.role === "instructor" ?
  "/instructor" :
  "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
            EduVibe
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <NavLink to="/courses" className={({ isActive }) => `transition-colors hover:text-foreground ${isActive ? "text-foreground" : ""}`}>
              Catalog
            </NavLink>
            <NavLink to="/instructors" className={({ isActive }) => `transition-colors hover:text-foreground ${isActive ? "text-foreground" : ""}`}>
              Mentors
            </NavLink>
            {user &&
            <Link to={dashHref} className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
            }
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ?
          <>
              <span className="text-sm text-muted-foreground">
                <span className="hidden lg:inline">Signed in as </span>
                <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span>
              </span>
              <button
              onClick={() => {
                logout();
                navigate(`/`);
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              
                Sign out
              </button>
            </> :

          <>
              <Link to="/login" className="text-sm font-medium text-foreground hover:opacity-70">
                Sign in
              </Link>
              <Link
              to="/signup"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-[0_2px_10px_oklch(0.24_0.018_50/0.2)] transition-colors hover:bg-foreground/90">
              
                Start learning
              </Link>
            </>
          }
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}>
          
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open &&
      <div className="border-t border-foreground/5 bg-background px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/courses" onClick={() => setOpen(false)} className="py-2">
              Catalog
            </Link>
            <Link to="/instructors" onClick={() => setOpen(false)} className="py-2">
              Mentors
            </Link>
            {user ?
          <>
                <Link to={dashHref} onClick={() => setOpen(false)} className="py-2">
                  Dashboard
                </Link>
                <button
              onClick={() => {
                logout();
                setOpen(false);
                navigate(`/`);
              }}
              className="rounded-full bg-secondary px-4 py-2.5 text-left font-medium">
              
                  Sign out
                </button>
              </> :

          <>
                <Link to="/login" onClick={() => setOpen(false)} className="py-2">
                  Sign in
                </Link>
                <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-foreground px-4 py-2.5 text-center font-medium text-background">
              
                  Start learning
                </Link>
              </>
          }
          </div>
        </div>
      }
    </header>);

}

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/5 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto_auto]">
        <div>
          <div className="text-xl font-bold tracking-tight">
            EduVibe
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A quiet space for deep focus. Curated curricula from leading practitioners.
          </p>
        </div>
        <FooterCol
          title="Learn"
          links={[
          { label: "Catalog", to: "/courses" },
          { label: "Mentors", to: "/instructors" }]
          } />
        
        <FooterCol
          title="Account"
          links={[
          { label: "Sign in", to: "/login" },
          { label: "Create account", to: "/signup" },
          { label: "Dashboard", to: "/dashboard" }]
          } />
        
      </div>
      <div className="border-t border-foreground/5 px-5 py-5 text-center text-xs text-muted-foreground sm:px-8">
        © {new Date().getFullYear()} EduVibe Learning Co. All rights reserved.
      </div>
    </footer>);

}

function FooterCol({
  title,
  links



}) {
  return (
    <div>
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {links.map((l) =>
        <li key={l.label}>
            <Link to={l.to} className="text-foreground/80 hover:text-foreground">
              {l.label}
            </Link>
          </li>
        )}
      </ul>
    </div>);

}