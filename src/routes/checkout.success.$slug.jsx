import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "../components/site-chrome.jsx";
import { Courses, Transactions } from "../lib/store.js";

import { downloadInvoice } from "../lib/invoices.js";
import { CheckCircle2, Download, PlayCircle, Receipt } from "lucide-react";

const search = z.object({ tx: z.string().optional() });


export const Route = {
  path: "/checkout/success/$slug",
  fullPath: "/checkout/success/$slug",
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
  useEffect(() => { document.title = "Payment successful — Lumen"; }, []);
  return <SuccessPage />;
}


function SuccessPage() {
  const { slug } = Route.useParams();
  const { tx: txId } = Route.useSearch();
  const [course, setCourse] = useState(null);
  const [tx, setTx] = useState(null);

  useEffect(() => {
    setCourse(Courses.bySlug(slug) ?? null);
    if (txId) setTx(Transactions.byId(txId) ?? null);
  }, [slug, txId]);

  if (!course) {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-5 py-32 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>);

  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <div className="rounded-[28px] border border-foreground/5 bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-9" strokeWidth={1.6} />
          </div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Payment confirmed
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            You're enrolled in
          </h1>
          <p className="mt-1 text-2xl font-medium text-glow">{course.title}</p>
          {tx &&
          <p className="mt-5 text-sm text-muted-foreground">
              We charged{" "}
              <span className="font-semibold text-foreground">${tx.amount.toFixed(2)}</span>{" "}
              to your {tx.cardBrand} •••• {tx.cardLast4}. Receipt{" "}
              <span className="font-mono">{tx.invoiceNumber}</span> was sent to{" "}
              {tx.billingEmail}.
            </p>
          }

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link
              to={`/learn/${course.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90">
              
              <PlayCircle className="size-4" /> Start learning
            </Link>
            {tx &&
            <button
              onClick={() => downloadInvoice(tx)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/10 bg-card px-6 py-3 text-sm font-medium hover:bg-secondary">
              
                <Download className="size-4" /> Download invoice
              </button>
            }
            <Link
              to="/dashboard/payments"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/10 bg-card px-6 py-3 text-sm font-medium hover:bg-secondary">
              
              <Receipt className="size-4" /> View receipts
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>);

}