import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { toast } from "sonner";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/settings",
  fullPath: "/admin/settings",
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
  useEffect(() => { document.title = "Settings — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const reset = () => {
    if (!confirm("Reset all local data to seed defaults?")) return;
    [
    "eduvibe.users",
    "eduvibe.courses",
    "eduvibe.enrollments",
    "eduvibe.transactions",
    "eduvibe.quizAttempts",
    "eduvibe.wishlist",
    "eduvibe.passwords",
    "eduvibe.session",
    "eduvibe.otp",
    "eduvibe.seedVersion"].
    forEach((k) => localStorage.removeItem(k));
    toast.success("Reset. Reloading…");
    setTimeout(() => location.reload(), 600);
  };

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Settings</h1>
      <div className="rounded-2xl border border-foreground/5 bg-card p-6">
        <h2 className="text-lg font-semibold">Demo data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This deployment uses a local mock backend. You can reset everything to the seed
          state at any time.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground hover:opacity-90">
          
          Reset demo data
        </button>
      </div>
    </>);

}