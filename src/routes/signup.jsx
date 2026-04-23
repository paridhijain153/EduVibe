import { Link, useLocation, useNavigate, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context.jsx";
import { Auth } from "../lib/store.js";

import { toast } from "sonner";
import { AuthShell, Field } from "./login";


export const Route = {
  path: "/signup",
  fullPath: "/signup",
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
  useEffect(() => { document.title = "Create account — EduVibe"; }, []);
  return <SignupPage />;
}




function SignupPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const startSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const code = Auth.generateOtp(email);
    setGeneratedOtp(code);
    setStep("otp");
    toast.success(`OTP sent to ${email}`, {
      description: `Demo code: ${code}`
    });
  };

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!Auth.verifyOtp(email, otp)) {
        toast.error("Invalid code. Try again.");
        return;
      }
      const user = await Auth.signup(name, email, password, role);
      await Auth.login(email, password);
      await refresh();
      toast.success(`Welcome to EduVibe, ${user.name.split(" ")[0]}!`);
      const target =
      role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/dashboard";
      navigate(target);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  if (step === "otp") {
    return (
      <AuthShell
        title="Verify your email."
        subtitle={`We sent a 6-digit code to ${email}.`}
        footer={
        <button
          onClick={() => setStep("form")}
          className="font-medium text-foreground hover:text-glow">
          
            ← Back to details
          </button>
        }>
        
        <form onSubmit={verify} className="space-y-4">
          <Field
            label="OTP code"
            value={otp}
            onChange={setOtp}
            placeholder="123456" />
          
          <div className="rounded-xl bg-glow-soft p-3 text-center text-xs text-foreground/70">
            Demo code: <span className="font-mono font-semibold">{generatedOtp}</span>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60">
            
            {busy ? "Verifying…" : "Verify & continue"}
          </button>
        </form>
      </AuthShell>);

  }

  return (
    <AuthShell
      title="Create your account."
      subtitle="Start learning, teaching, or both."
      footer={
      <>
          Already a member?{" "}
          <Link to="/login" className="font-medium text-foreground hover:text-glow">
            Sign in
          </Link>
        </>
      }>
      
      <form onSubmit={startSignup} className="space-y-4">
        <Field label="Full name" value={name} onChange={setName} placeholder="Jane Doe" />
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
          placeholder="At least 8 characters" />
        

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            I am a
          </span>
          <div className="grid grid-cols-2 gap-2">
            {["student", "instructor"].map((r) =>
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${
              role === r ?
              "border-glow bg-glow-soft text-foreground" :
              "border-foreground/10 bg-background text-foreground/70 hover:bg-secondary"}`
              }>
              
                {r}
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90">
          
          Continue
        </button>
      </form>
    </AuthShell>);

}