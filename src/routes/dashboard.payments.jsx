import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DashboardShell } from "../components/dashboard-shell.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Courses, Transactions } from "../lib/store.js";
import { downloadInvoice } from "../lib/invoices.js";
import { EmptyCard } from "./dashboard.index";
import { CreditCard, Download, Receipt as ReceiptIcon } from "lucide-react";


function _PageInline() {
  return (
  <DashboardShell requireRole="student">
      <Inner />
    </DashboardShell>);
}

export const Route = {
  path: "/dashboard/payments",
  fullPath: "/dashboard/payments",
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
  useEffect(() => { document.title = "Payments — EduVibe"; }, []);
  return <_PageInline />;
}


function Inner() {
  const { user } = useAuth();
  if (!user) return null;
  const txs = Transactions.forUser(user.id).sort((a, b) =>
  b.date.localeCompare(a.date)
  );
  const total = txs.
  filter((t) => t.status === "paid").
  reduce((a, t) => a + t.amount, 0);
  const totalSaved = txs.reduce((a, t) => a + t.discount, 0);

  return (
    <>
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Billing
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Payments & receipts
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every EduVibe purchase you've made, with downloadable PDF invoices.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Tile
          icon={<CreditCard className="size-4" />}
          label="Total spent"
          value={`$${total.toFixed(2)}`} />
        
        <Tile
          icon={<ReceiptIcon className="size-4" />}
          label="Receipts"
          value={String(txs.length)} />
        
        <Tile
          icon={<ReceiptIcon className="size-4" />}
          label="Saved with coupons"
          value={`$${totalSaved.toFixed(2)}`} />
        
      </div>

      {txs.length === 0 ?
      <EmptyCard
        title="No transactions yet"
        body="Paid course purchases will appear here as branded invoices."
        ctaHref="/courses"
        ctaLabel="Browse catalog" /> :


      <div className="overflow-hidden rounded-2xl border border-foreground/5 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-foreground/5 bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Course</th>
                  <th className="px-5 py-3 text-left">Method</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => {
                const c = Courses.byId(t.courseId);
                return (
                  <tr
                    key={t.id}
                    className="border-b border-foreground/5 last:border-b-0">
                    
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-semibold">
                          {t.invoiceNumber}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium">{c?.title ?? "—"}</div>
                        {t.couponCode &&
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                            Coupon {t.couponCode} · -${t.discount}
                          </div>
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
                        <button
                        onClick={() => downloadInvoice(t)}
                        className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                        
                          <Download className="size-3.5" /> PDF
                        </button>
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

function Tile({
  icon,
  label,
  value




}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>);

}