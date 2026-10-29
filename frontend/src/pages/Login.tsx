import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, Smartphone, KeyRound, ArrowLeft, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

type LoginMode = "password" | "otp-identifier" | "otp-verify";

export default function Login() {
  const [mode, setMode]           = useState<LoginMode>("password");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otpDigits, setOtpDigits] = useState(["","","","","",""]);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpRole, setOtpRole]     = useState<"user" | "farmer">("user");
  const navigate                  = useNavigate();
  const { login, sendOtp, verifyOtp, user } = useAuth();
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/dashboard" : "/home", { replace: true });
  }, [user]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCountdown = () => {
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally { setIsLoading(false); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result: any = await sendOtp(identifier, otpRole);
      setMode("otp-verify");
      startCountdown();

      // Dev mode: backend returns devOtp — auto-fill boxes so testing is instant
      if (result?.devOtp) {
        const digits = String(result.devOtp).split("").slice(0, 6);
        setOtpDigits(digits);
        toast.success(`OTP sent! Dev code: ${result.devOtp}`, { duration: 8000 });
        setTimeout(() => digitRefs.current[5]?.focus(), 100);
      } else {
        toast.success("OTP sent!");
        setTimeout(() => digitRefs.current[0]?.focus(), 100);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally { setIsLoading(false); }
  };

  const handleDigitChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
    if (v && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) digitRefs.current[i - 1]?.focus();
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { setOtpDigits(text.split("")); digitRefs.current[5]?.focus(); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    setIsLoading(true);
    try {
      await verifyOtp(identifier, code);
      toast.success("Verified! Welcome 🌾");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
      setOtpDigits(["","","","","",""]);
      digitRefs.current[0]?.focus();
    } finally { setIsLoading(false); }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await sendOtp(identifier);
      toast.success("New OTP sent!");
      setOtpDigits(["","","","","",""]);
      startCountdown();
      digitRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome to KrishiSeva</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Use your email & password or OTP</CardDescription>
          </CardHeader>

          {/* Mode toggle */}
          {mode !== "otp-verify" && (
            <div className="mx-6 mb-4 flex rounded-lg border overflow-hidden">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "password" ? "bg-emerald-600 text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}
                onClick={() => setMode("password")}
              >Password</button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === "otp-identifier" ? "bg-emerald-600 text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}
                onClick={() => setMode("otp-identifier")}
              ><Smartphone className="h-3.5 w-3.5" /> OTP</button>
            </div>
          )}

          {/* Password */}
          {mode === "password" && (
            <CardContent>
              <form onSubmit={handlePasswordLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required autoFocus />
                </div>
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
                </button>
              </form>
            </CardContent>
          )}

          {/* OTP identifier */}
          {mode === "otp-identifier" && (
            <CardContent>
              <form onSubmit={handleSendOtp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email or Phone Number</Label>
                  <Input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="name@example.com or +91 98765..." required autoFocus />
                </div>
                
                {/* Role Specific Verification */}
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold text-stone-600">I am signing in as:</Label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100/80 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setOtpRole("user")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${otpRole === "user" ? "bg-white text-emerald-800 shadow-sm border border-stone-200/50" : "text-stone-500 hover:text-stone-800"}`}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpRole("farmer")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${otpRole === "farmer" ? "bg-white text-emerald-800 shadow-sm border border-stone-200/50" : "text-stone-500 hover:text-stone-800"}`}
                    >
                      Farmer / Seller
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Send OTP
                </button>
              </form>
            </CardContent>
          )}

          {/* OTP verify */}
          {mode === "otp-verify" && (
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => { setMode("otp-identifier"); setOtpDigits(["","","","","",""]); }} className="text-stone-400 hover:text-stone-600">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <span className="text-stone-600">Code sent to <strong>{identifier.slice(0,3)}***{identifier.slice(-4)}</strong></span>
                  {countdown > 0 && <span className="text-emerald-600 font-mono font-bold">{fmt(countdown)}</span>}
                </div>
              </div>
              <form onSubmit={handleVerifyOtp} className="grid gap-5">
                <div className="flex justify-center gap-2" onPaste={handleDigitPaste}>
                  {otpDigits.map((digit, i) => (
                    <input key={i} ref={el => { digitRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(i, e)}
                      className="h-12 w-10 rounded-lg border-2 text-center text-xl font-bold text-stone-900 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>
                <button type="submit" disabled={isLoading || otpDigits.join("").length < 6}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Verify & Sign In
                </button>
                <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || isLoading}
                  className={`flex items-center justify-center gap-1.5 text-sm mx-auto transition-colors ${countdown > 0 ? "text-stone-400 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700"}`}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {countdown > 0 ? `Resend in ${fmt(countdown)}` : "Resend OTP"}
                </button>
              </form>
            </CardContent>
          )}

          <CardFooter className="pt-0">
            <p className="w-full text-center text-sm text-stone-500">
              New to KrishiSeva?{" "}
              <Link to="/register" className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700">Create account</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
