import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context.jsx";
import { Auth } from "../lib/store.js";
import { toast } from "sonner";


export const Route = {
  path: "/login",
  fullPath: "/login",
  useParams: () => useParams(),
  useSearch: () => {
    const _loc = useLocation();
    const _sp = new URLSearchParams(_loc.search);
    const _o = {};
    _sp.forEach((v, k) => { _o[k] = v; });
    return _o;
  },
};

export default function Page() {
  return <LoginPage />;
}


function LoginPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Sign in — EduVibe";
    Auth.logout();
    refresh();
  }, [refresh]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const user = await Auth.login(email, password);
      await refresh();
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const target =
      user.role === "admin" ?
      "/admin" :
      user.role === "instructor" ?
      "/instructor" :
      "/dashboard";
      navigate(target);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to continue your pathway."
      footer={
      <>
          New to EduVibe?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:text-glow">
            Create an account
          </Link>
        </>
      }>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com" />
        
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••" />
        
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60">
          
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-foreground/5 bg-secondary/40 p-4 text-xs text-muted-foreground">
        <div className="mb-2 font-semibold uppercase tracking-widest text-foreground/70">
          Demo accounts
        </div>
        <ul className="space-y-1 font-mono">
          <li>sam@eduvibe.edu (student)</li>
          <li>thorne@eduvibe.edu (instructor)</li>
          <li>admin@eduvibe.edu (admin)</li>
          <li className="pt-1 not-italic">password: demo1234</li>
        </ul>
      </div>
    </AuthShell>);

}

export function AuthShell({
  title,
  subtitle,
  children,
  footer





}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-glow/10 blur-[140px]" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-16">
        <Link to="/" className="mb-10 text-2xl font-bold tracking-tight">
          EduVibe<span className="text-glow">.</span>
        </Link>
        <div className="w-full rounded-3xl border border-foreground/5 bg-card p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        {footer &&
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        }
      </div>
    </div>);

}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder






}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-glow focus:ring-2 focus:ring-glow/20" />
      
    </label>);

}