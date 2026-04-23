import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "../components/site-chrome.jsx";
import { useAuth } from "../lib/auth-context.jsx";
import { Coupons, Courses, Enrollments, Transactions } from "../lib/store.js";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
  User as UserIcon,
  Wallet } from
"lucide-react";



function _qs(o) {
  if (!o) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? "?" + s : "";
}

export const Route = {
  path: "/checkout/$slug",
  fullPath: "/checkout/$slug",
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
  useEffect(() => { document.title = "Checkout · ${params.slug} — Lumen"; }, []);
  return <CheckoutPage />;
}



const STEPS = [
{ key: 0, title: "Review", icon: <ShoppingBag className="size-3.5" /> },
{ key: 1, title: "Billing", icon: <UserIcon className="size-3.5" /> },
{ key: 2, title: "Payment", icon: <CreditCard className="size-3.5" /> },
{ key: 3, title: "Confirm", icon: <ShieldCheck className="size-3.5" /> }];


function CheckoutPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [step, setStep] = useState(0);

  // Billing
  const [billingEmail, setBillingEmail] = useState("");
  const [country, setCountry] = useState("United States");
  const [postal, setPostal] = useState("94110");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Payment
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvc, setCvc] = useState("123");
  const [cardholderName, setCardholderName] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setCourse(Courses.bySlug(slug) ?? null);
    setResolved(true);
  }, [slug]);

  useEffect(() => {
    if (user) {
      if (user.role !== "student") {
        toast.error("Only students can purchase courses.");
        navigate(`/courses/${slug}`);
        return;
      }
      setCardholderName(user.name);
      setBillingEmail(user.email);
    } else if (resolved) {
      navigate(`/login`);
    }
  }, [user, resolved, navigate, slug]);

  const subtotal = course?.price ?? 0;
  const discount = appliedCoupon ?
  Math.round(subtotal * (appliedCoupon.percentOff / 100)) :
  0;
  const total = Math.max(0, subtotal - discount);

  const enrolled = useMemo(
    () => user && course ? !!Enrollments.get(user.id, course.id) : false,
    [user, course]
  );

  if (!resolved) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>);

  }

  if (!course) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="text-3xl font-semibold">Course not found</h1>
          <Link to="/courses" className="mt-6 inline-block text-glow hover:underline">
            Back to catalog →
          </Link>
        </div>
      </div>);

  }

  if (course.price === 0) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="text-3xl font-semibold">This course is free</h1>
          <p className="mt-2 text-muted-foreground">No checkout required.</p>
          <Link
            to={`/courses/${course.slug}`}
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            
            Go to course →
          </Link>
        </div>
      </div>);

  }

  if (enrolled) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="text-3xl font-semibold">You already own this course</h1>
          <Link
            to={`/learn/${course.slug}`}
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            
            Continue learning →
          </Link>
        </div>
      </div>);

  }

  const applyCoupon = () => {
    const found = Coupons.find(couponInput);
    if (!found) {
      toast.error("Invalid coupon code");
      return;
    }
    setAppliedCoupon(found);
    toast.success(`Applied ${found.code} · ${found.percentOff}% off`);
  };

  const formatCard = (raw) =>
  raw.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (raw) => {
    const d = raw.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validateBilling = () => {
    if (!/^\S+@\S+\.\S+$/.test(billingEmail)) return "Enter a valid email";
    if (address.trim().length < 3) return "Enter your billing address";
    if (city.trim().length < 2) return "Enter your city";
    if (postal.trim().length < 3) return "Enter a postal code";
    return null;
  };
  const validatePayment = () => {
    if (cardNumber.replace(/\D/g, "").length < 13) return "Enter a valid card number";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Enter expiry as MM/YY";
    if (!/^\d{3,4}$/.test(cvc)) return "Enter the CVC";
    if (cardholderName.trim().length < 2) return "Enter the cardholder name";
    return null;
  };

  const goNext = () => {
    if (step === 1) {
      const e = validateBilling();
      if (e) return toast.error(e);
    }
    if (step === 2) {
      const e = validatePayment();
      if (e) return toast.error(e);
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handlePay = async () => {
    if (!user) return;
    if (!agreed) return toast.error("Please accept the terms to continue");
    const billErr = validateBilling();
    if (billErr) return toast.error(billErr);
    const payErr = validatePayment();
    if (payErr) return toast.error(payErr);

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const tx = Transactions.checkout({
      userId: user.id,
      courseId: course.id,
      subtotal,
      couponCode: appliedCoupon?.code,
      cardNumber,
      cardholderName,
      billingEmail
    });
    Enrollments.enroll(user.id, course.id);
    setProcessing(false);
    toast.success("Payment successful");
    navigate(`/checkout/success/${course.slug}` + _qs({ tx: tx.id }));
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Secure checkout
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Complete your enrollment
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            256-bit encrypted · sandbox mode
          </div>
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left: phased content */}
          <div className="space-y-6">
            {step === 0 &&
            <Section title="Review your order" icon={<ShoppingBag className="size-4" />}>
                <div className="flex gap-4">
                  <div
                  className={`relative h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${course.thumbnail}`}>
                  
                    {course.image &&
                  <img
                    src={course.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover" />

                  }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {course.category} · {course.level}
                    </div>
                    <div className="mt-1 truncate text-lg font-semibold">
                      {course.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Instructed by {course.instructorName}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {course.durationHours.toFixed(1)} hours · lifetime access
                    </div>
                  </div>
                </div>
                <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {[
                "All lessons & quizzes included",
                "Certificate on completion",
                "Mobile + desktop access",
                "30-day money-back guarantee"].
                map((b) =>
                <li key={b} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4 text-glow" /> {b}
                    </li>
                )}
                </ul>
              </Section>
            }

            {step === 1 &&
            <Section title="Billing details" icon={<UserIcon className="size-4" />}>
                <Field label="Email">
                  <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="ck-input"
                  placeholder="you@example.com" />
                
                </Field>
                <Field label="Address line">
                  <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="ck-input"
                  placeholder="123 Market Street" />
                
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="ck-input"
                    placeholder="San Francisco" />
                  
                  </Field>
                  <Field label="Postal code">
                    <input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    className="ck-input" />
                  
                  </Field>
                </div>
                <Field label="Country">
                  <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="ck-input">
                  
                    {[
                  "United States",
                  "United Kingdom",
                  "Canada",
                  "Germany",
                  "India",
                  "Australia",
                  "Other"].
                  map((c) =>
                  <option key={c}>{c}</option>
                  )}
                  </select>
                </Field>
              </Section>
            }

            {step === 2 &&
            <Section title="Payment method" icon={<CreditCard className="size-4" />}>
                <Field label="Card number">
                  <div className="relative">
                    <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    className="ck-input pr-16"
                    placeholder="1234 1234 1234 1234" />
                  
                    <CreditCard className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry (MM/YY)">
                    <input
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="ck-input"
                    placeholder="MM/YY" />
                  
                  </Field>
                  <Field label="CVC">
                    <input
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="ck-input"
                    placeholder="123" />
                  
                  </Field>
                </div>
                <Field label="Cardholder name">
                  <input
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="ck-input"
                  placeholder="Full name on card" />
                
                </Field>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Sandbox checkout — try{" "}
                  <span className="font-mono">4242 4242 4242 4242</span>.
                </p>
              </Section>
            }

            {step === 3 &&
            <Section title="Review & confirm" icon={<ShieldCheck className="size-4" />}>
                <Summary
                title="Billed to"
                rows={[
                ["Email", billingEmail],
                ["Address", `${address}, ${city} ${postal}`],
                ["Country", country]]
                }
                onEdit={() => setStep(1)} />
              
                <Summary
                title="Payment"
                rows={[
                ["Card", `•••• •••• •••• ${cardNumber.replace(/\s/g, "").slice(-4)}`],
                ["Expiry", expiry],
                ["Name", cardholderName]]
                }
                onEdit={() => setStep(2)} />
              
                <label className="mt-2 flex items-start gap-3 rounded-xl border border-foreground/10 bg-secondary/40 p-4 text-sm">
                  <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 size-4 accent-foreground" />
                
                  <span className="text-muted-foreground">
                    I agree to Lumen's{" "}
                    <span className="text-foreground underline">Terms of Service</span> and{" "}
                    <span className="text-foreground underline">Refund Policy</span>. I
                    authorize a charge of{" "}
                    <span className="font-semibold text-foreground">${total.toFixed(2)}</span>.
                  </span>
                </label>
              </Section>
            }

            {/* Nav buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-40">
                
                <ArrowLeft className="size-4" /> Back
              </button>
              {step < 3 ?
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90">
                
                  Continue <ArrowRight className="size-4" />
                </button> :

              <button
                onClick={handlePay}
                disabled={processing || !agreed}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 disabled:opacity-60">
                
                  {processing ?
                "Processing…" :

                <>
                      <Lock className="size-4" /> Pay ${total.toFixed(2)}
                    </>
                }
                </button>
              }
            </div>
          </div>

          {/* Right: order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-foreground/5 bg-card">
              <div
                className={`relative aspect-[16/9] bg-gradient-to-br ${course.thumbnail}`}>
                
                {course.image &&
                <img
                  src={course.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover" />

                }
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {course.category}
                </div>
                <div className="mt-1 text-lg font-semibold leading-snug">
                  {course.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {course.instructorName} · {course.durationHours.toFixed(1)} hours
                </div>

                <div className="my-5 h-px bg-foreground/5" />

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <Tag className="size-3.5" /> Coupon
                  </div>
                  {appliedCoupon ?
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {appliedCoupon.code} · {appliedCoupon.percentOff}% off
                      </span>
                      <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground">
                      
                        Remove
                      </button>
                    </div> :

                  <div className="flex gap-2">
                      <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Try LUMEN10"
                      className="ck-input flex-1" />
                    
                      <button
                      onClick={applyCoupon}
                      className="shrink-0 rounded-full border border-foreground/10 bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                      
                        Apply
                      </button>
                    </div>
                  }
                </div>

                <div className="my-5 h-px bg-foreground/5" />

                <dl className="space-y-2 text-sm">
                  <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                  {discount > 0 &&
                  <Row
                    label={`Discount (${appliedCoupon?.code})`}
                    value={`-$${discount.toFixed(2)}`}
                    accent />

                  }
                  <Row label="Tax" value="$0.00" muted />
                </dl>

                <div className="my-5 h-px bg-foreground/5" />

                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Total
                  </div>
                  <div className="text-3xl font-semibold tabular-nums">
                    ${total.toFixed(2)}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                  <Wallet className="size-3.5" /> Step {step + 1} of 4 ·{" "}
                  {STEPS[step].title}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
      <style>{`
        .ck-input {
          width: 100%;
          background: var(--background);
          border: 1px solid color-mix(in oklab, var(--foreground) 12%, transparent);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s;
        }
        .ck-input:focus { border-color: color-mix(in oklab, var(--foreground) 35%, transparent); }
      `}</style>
    </div>);

}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
              done ?
              "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
              active ?
              "border-foreground bg-foreground text-background" :
              "border-foreground/10 bg-card text-muted-foreground"}`
              }>
              
              {done ? <CheckCircle2 className="size-4" /> : i + 1}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${
                active ? "text-foreground" : "text-muted-foreground"}`
                }>
                
                {s.icon} {s.title}
              </div>
            </div>
            {i < STEPS.length - 1 &&
            <div className="h-px flex-1 bg-foreground/10" aria-hidden />
            }
          </li>);

      })}
    </ol>);

}

function Section({
  title,
  icon,
  children




}) {
  return (
    <section className="rounded-3xl border border-foreground/5 bg-card p-6">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </section>);

}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </label>);

}

function Row({
  label,
  value,
  muted,
  accent





}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd
        className={`tabular-nums ${
        accent ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`
        }>
        
        {value}
      </dd>
    </div>);

}

function Summary({
  title,
  rows,
  onEdit




}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-secondary/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </div>
        <button
          onClick={onEdit}
          className="text-xs font-medium text-glow hover:underline">
          
          Edit
        </button>
      </div>
      <dl className="space-y-1 text-sm">
        {rows.map(([k, v]) =>
        <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="truncate text-right">{v}</dd>
          </div>
        )}
      </dl>
    </div>);

}