import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { Courses, Transactions, Users } from "../lib/store.js";
import { downloadInvoice } from "../lib/invoices.js";

import { toast } from "sonner";
import {
  ArrowDownToLine,
  DollarSign,
  Receipt,
  RefreshCcw,
  Search,
  TrendingUp } from
"lucide-react";
import { Kpi } from "./admin.index";


function _PageInline() {
  return (
  <DashboardShell requireRole="admin">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/admin/payments",
  fullPath: "/admin/payments",
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
  useEffect(() => { document.title = "Payments — Admin — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const [txs, setTxs] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [, force] = useState(0);

  useEffect(() => {
    setTxs(Transactions.all());
  }, []);

  const filtered = useMemo(() => {
    let list = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    if (status !== "all") list = list.filter((t) => t.status === status);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((t) => {
        const u = Users.byId(t.userId);
        const c = Courses.byId(t.courseId);
        return (
          t.invoiceNumber.toLowerCase().includes(needle) || (
          u?.name.toLowerCase().includes(needle) ?? false) || (
          u?.email.toLowerCase().includes(needle) ?? false) || (
          c?.title.toLowerCase().includes(needle) ?? false));

      });
    }
    return list;
  }, [txs, q, status]);

  const grossRevenue = txs.
  filter((t) => t.status === "paid").
  reduce((a, t) => a + t.amount, 0);
  const refunded = txs.
  filter((t) => t.status === "refunded").
  reduce((a, t) => a + t.amount, 0);
  const avgOrder = txs.length ? Math.round(grossRevenue / txs.length) : 0;

  // Last 14 days revenue spark
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      total: 0
    });
  }
  for (const t of txs) {
    if (t.status !== "paid") continue;
    const day = t.date.slice(0, 10);
    const b = days.find((x) => x.iso === day);
    if (b) b.total += t.amount;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const handleRefund = (id) => {
    if (!confirm("Mark this transaction as refunded?")) return;
    Transactions.refund(id);
    setTxs(Transactions.all());
    toast.success("Refund recorded");
    force((x) => x + 1);
  };

  const exportCsv = () => {
    const header = [
    "invoice",
    "date",
    "student",
    "email",
    "course",
    "subtotal",
    "discount",
    "coupon",
    "amount",
    "status",
    "card"];

    const rows = filtered.map((t) => {
      const u = Users.byId(t.userId);
      const c = Courses.byId(t.courseId);
      return [
      t.invoiceNumber,
      t.date,
      u?.name ?? "",
      u?.email ?? "",
      c?.title ?? "",
      t.subtotal,
      t.discount,
      t.couponCode ?? "",
      t.amount,
      t.status,
      `${t.cardBrand} ${t.cardLast4}`].

      map((v) => `"${String(v).replace(/"/g, '""')}"`).
      join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduvibe-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Finance
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Payments
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every transaction processed through EduVibe checkout.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          
          <ArrowDownToLine className="size-4" /> Export CSV
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<DollarSign className="size-4" />}
          label="Gross revenue"
          value={`$${grossRevenue.toFixed(0)}`}
          hint={`${txs.length} transactions`} />
        
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Avg. order value"
          value={`$${avgOrder}`} />
        
        <Kpi
          icon={<RefreshCcw className="size-4" />}
          label="Refunded"
          value={`$${refunded.toFixed(0)}`} />
        
        <Kpi
          icon={<Receipt className="size-4" />}
          label="Net revenue"
          value={`$${(grossRevenue - refunded).toFixed(0)}`} />
        
      </div>

      <div className="mb-6 rounded-2xl border border-foreground/5 bg-card p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Revenue · last 14 days
        </div>
        <div className="flex h-32 items-end gap-1">
          {days.map((d) =>
          <div key={d.iso} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                className="w-full rounded-t-sm bg-glow/80"
                style={{
                  height: `${Math.max(6, Math.round(d.total / maxDay * 100))}%`
                }}
                title={`${d.label}: $${d.total}`} />
              
              </div>
              <div className="text-[9px] text-muted-foreground">{d.label.split(" ")[1]}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search invoice, student, course…"
            className="w-full rounded-full border border-foreground/10 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground/30" />
          
        </div>
        <div className="inline-flex rounded-full border border-foreground/10 bg-card p-1 text-xs font-medium">
          {["all", "paid", "refunded"].map((s) =>
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
            status === s ?
            "bg-foreground text-background" :
            "text-muted-foreground hover:text-foreground"}`
            }>
            
              {s}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ?
      <div className="rounded-2xl border border-dashed border-foreground/10 p-10 text-center text-sm text-muted-foreground">
          No transactions match your filters.
        </div> :

      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-foreground/5 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Course</th>
                  <th className="px-5 py-3 text-left">Method</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                const u = Users.byId(t.userId);
                const c = Courses.byId(t.courseId);
                return (
                  <tr key={t.id} className="border-b border-foreground/5 last:border-b-0">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-semibold">
                          {t.invoiceNumber}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {u ?
                      <Link
                        to={`/admin/students/${u.id}`}
                        className="font-medium hover:text-glow">
                        
                            {u.name}
                          </Link> :

                      "—"
                      }
                        <div className="text-xs text-muted-foreground">{u?.email ?? ""}</div>
                      </td>
                      <td className="px-5 py-4">
                        {c ?
                      <Link
                        to={`/courses/${c.slug}`}
                        className="font-medium hover:text-glow">
                        
                            {c.title}
                          </Link> :

                      "—"
                      }
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {t.cardBrand} •••• {t.cardLast4}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums">
                        ${t.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.status === "paid" ?
                        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                        "bg-muted text-muted-foreground"}`
                        }>
                        
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                          onClick={() => downloadInvoice(t)}
                          className="rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                          
                            PDF
                          </button>
                          {t.status === "paid" &&
                        <button
                          onClick={() => handleRefund(t.id)}
                          className="rounded-full border border-destructive/20 bg-card px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                          
                              Refund
                            </button>
                        }
                        </div>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        </div>
      }
    </>);

}