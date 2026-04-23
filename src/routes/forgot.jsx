import { Link, useLocation, useParams } from "react-router-dom";import { useEffect, useState } from "react";
import { Auth } from "../lib/store.js";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";


export const Route = {
  path: "/forgot",
  fullPath: "/forgot",
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
  useEffect(() => { document.title = "Reset password — EduVibe"; }, []);
  return <ForgotPage />;
}


function ForgotPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [password, setPassword] = useState("");

  const requestReset = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email.");
    const code = Auth.generateOtp(email);
    setGeneratedOtp(code);
    setStep("reset");
    toast.success(`OTP sent to ${email}`, { description: `Demo code: ${code}` });
  };

  const reset = (e) => {
    e.preventDefault();
    if (!Auth.verifyOtp(email, otp)) return toast.error("Invalid code");
    if (password.length < 8) return toast.error("Password must be at least 8 chars");
    Auth.setPassword(email, password);
    toast.success("Password reset. You can sign in now.");
    setStep("email");
    setEmail("");
    setPassword("");
    setOtp("");
  };

  return (
    <AuthShell
      title={step === "email" ? "Reset your password." : "Choose a new password."}
      subtitle={
      step === "email" ?
      "We'll email you a one-time code." :
      `Enter the code sent to ${email}.`
      }
      footer={
      <Link to="/login" className="font-medium text-foreground hover:text-glow">
          ← Back to sign in
        </Link>
      }>
      
      {step === "email" ?
      <form onSubmit={requestReset} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <button className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90">
            Send code
          </button>
        </form> :

      <form onSubmit={reset} className="space-y-4">
          <Field label="OTP code" value={otp} onChange={setOtp} placeholder="123456" />
          <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword} />
        
          <div className="rounded-xl bg-glow-soft p-3 text-center text-xs text-foreground/70">
            Demo code: <span className="font-mono font-semibold">{generatedOtp}</span>
          </div>
          <button className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90">
            Reset password
          </button>
        </form>
      }
    </AuthShell>);

}