import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { Users } from "../lib/store.js";
import { useAuth } from "../lib/auth-context.jsx";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/users",
  fullPath: "/admin/users",
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
  useEffect(() => { document.title = "Users — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  const [, force] = useState(0);
  const list = Users.all();

  const onDelete = (id) => {
    if (id === user?.id) return toast.error("You can't delete yourself.");
    if (!confirm("Delete this user?")) return;
    Users.remove(id);
    toast.success("User deleted");
    force((x) => x + 1);
  };

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Users</h1>
      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/5 bg-secondary/30 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) =>
            <tr key={u.id} className="border-b border-foreground/5 last:border-b-0">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 text-right">
                  <button
                  onClick={() => onDelete(u.id)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete">
                  
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>);

}