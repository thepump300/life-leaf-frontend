"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, User, Mail, Lock, Check, X,
  Zap, Shield, QrCode, Users, RefreshCw, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/services/api";

// ── Password strength ──────────────────────────────────────────────────
function getStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)          s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const S_COLOR = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
const S_LABEL = ["", "Weak", "Fair", "Good", "Strong"];

const PWD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ── Google SVG ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

// ── Animated background particles ─────────────────────────────────────
function BgParticles() {
  return (
    <div className="ac-particles" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`ac-orb ac-orb-${i + 1}`} />
      ))}
    </div>
  );
}

// ── Feature card (welcome panel) ───────────────────────────────────────
function FeatureCard({ icon, label, sub }) {
  return (
    <div className="ac-feature-card">
      <div className="ac-feature-icon">{icon}</div>
      <div>
        <div className="ac-feature-label">{label}</div>
        <div className="ac-feature-sub">{sub}</div>
      </div>
    </div>
  );
}

// ── Validated input row ────────────────────────────────────────────────
function InputField({ type = "text", placeholder, value, onChange, icon, right, valid, touched, autoComplete }) {
  return (
    <div className={`ac-input-wrap${touched && value ? (valid ? " ac-valid" : " ac-invalid") : ""}`}>
      <span className="ac-input-icon-left">{icon}</span>
      <input
        className="ac-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
      {right && <span className="ac-input-icon-right">{right}</span>}
      {touched && value && (
        <span className="ac-input-status">
          {valid
            ? <Check size={13} className="ac-check" />
            : <X size={13} className="ac-cross" />}
        </span>
      )}
    </div>
  );
}

export default function AuthPage({ defaultMode = "login" }) {
  const router = useRouter();

  const [toggled, setToggled]         = useState(defaultMode === "register");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [showRules, setShowRules]     = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData,   setRegData]   = useState({ name: "", email: "", password: "", confirm: "" });
  const [touched,   setTouch]     = useState({});

  // OTP step
  const [otpStep,      setOtpStep]      = useState(false);
  const [otp,          setOtp]          = useState(["", "", "", "", "", ""]);
  const [otpEmail,     setOtpEmail]     = useState("");
  const [countdown,    setCountdown]    = useState(30);
  const [canResend,    setCanResend]    = useState(false);
  const [resending,    setResending]    = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!otpStep) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpStep]);

  const handleOtpChange = (i, val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp]; next[i] = cleaned; setOtp(next);
    if (cleaned && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const touch = (field) => setTouch((t) => ({ ...t, [field]: true }));

  const strength   = getStrength(regData.password);
  const emailValid = (v) => /^\S+@\S+\.\S+$/.test(v);

  // ── Login ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.login({ email: loginData.email, password: loginData.password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/");
    } catch (err) {
      if (err.data?.requiresVerification && err.data?.email) {
        toast.error("Please verify your email. A new OTP was sent.");
        setOtpEmail(err.data.email);
        setOtp(["", "", "", "", "", ""]);
        setCountdown(30); setCanResend(false);
        setOtpStep(true); setToggled(true);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({ name: regData.name, email: regData.email, password: regData.password });
      toast.success("OTP sent! Check your email.");
      setOtpEmail(regData.email);
      setOtp(["", "", "", "", "", ""]);
      setCountdown(30); setCanResend(false);
      setOtpStep(true);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const data = await authAPI.verifyEmail({ email: otpEmail, otp: code });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      toast.success("Email verified! Welcome to Community.");
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ───────────────────────────────────────────────────
  const googleLogin = () => {
    const client = window.google?.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          toast.error("Google sign-in failed. Please try again.");
          return;
        }
        try {
          const data = await authAPI.googleAuth(tokenResponse.access_token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("user",  JSON.stringify(data.user));
          toast.success(`Welcome, ${data.user.name}!`);
          router.push("/");
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
    client?.requestAccessToken();
  };

  // ── Resend OTP ───────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await authAPI.resendOTP(otpEmail);
      toast.success("New OTP sent to your email");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(30); setCanResend(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="ac-page">
      <BgParticles />

      <div className="ac-card-wrap">
        <div className={`ac-card${toggled ? " toggled" : ""}`}>

          {/* ── Diagonal shape ── */}
          <div className="ac-shape" />
          <div className="ac-shape2" />

          {/* ════════ LOGIN FORM ════════ */}
          <div className="ac-panel ac-login">
            <div className="ac-panel-inner">
              <div className="ac-panel-top">
                <div className="ac-avatar">
                  <img src="/images/logo.jpg" alt="Community" />
                </div>
                <h2 className="ac-panel-title">Welcome back</h2>
                <p className="ac-panel-sub">Sign in to your Community account</p>
              </div>

              <form onSubmit={handleLogin} className="ac-form" noValidate>
                <InputField
                  type="email"
                  placeholder="Email address"
                  value={loginData.email}
                  onChange={(e) => { setLoginData((p) => ({ ...p, email: e.target.value })); touch("lemail"); }}
                  icon={<Mail size={15} />}
                  touched={touched.lemail}
                  valid={emailValid(loginData.email)}
                  autoComplete="email"
                />

                <InputField
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  icon={<Lock size={15} />}
                  touched={false}
                  autoComplete="current-password"
                  right={
                    <button type="button" className="ac-eye-btn" onClick={() => setShowPass((v) => !v)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <div className="ac-row-between">
                  <label className="ac-remember">
                    <input type="checkbox" className="ac-checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="/forgot-password" className="ac-forgot">Forgot password?</a>
                </div>

                <button type="submit" className="ac-btn btn-shimmer" disabled={loading}>
                  {loading ? <Spinner label="Signing in…" /> : "Sign In"}
                </button>

                <Divider />

                <button type="button" className="ac-google btn-shimmer" onClick={() => googleLogin()}>
                  <GoogleIcon />
                  Continue with Google
                </button>

                <p className="ac-switch">
                  Don&apos;t have an account?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setToggled(true); }}>Sign Up</a>
                </p>
              </form>
            </div>
          </div>

          {/* ════════ LOGIN WELCOME ════════ */}
          <div className="ac-welcome ac-wel-login">
            <div className="ac-welcome-inner">
              <div className="ac-welcome-logo">
                <img src="/images/logo.jpg" alt="Community" />
              </div>
              <h2 className="ac-welcome-title">WELCOME<br />BACK!</h2>
              <p className="ac-welcome-sub">Manage your vehicle QR identity<br />and stay protected.</p>

              <div className="ac-features">
                <FeatureCard icon={<QrCode size={16} />}  label="Instant QR"        sub="Scan & report in seconds" />
                <FeatureCard icon={<Shield size={16} />}  label="Privacy First"     sub="No personal data shared" />
                <FeatureCard icon={<Zap size={16} />}     label="Live Alerts"       sub="Notify emergency contacts" />
              </div>
            </div>
          </div>

          {/* ════════ REGISTER FORM ════════ */}
          <div className="ac-panel ac-register">
            <div className="ac-panel-inner">

              {otpStep ? (
                /* ── OTP Step ── */
                <>
                  <div className="ac-panel-top">
                    <div className="ac-avatar" style={{ background: "rgba(240,112,40,0.12)", border: "1px solid rgba(240,112,40,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Mail size={26} color="#F07028" />
                    </div>
                    <h2 className="ac-panel-title">Check your email</h2>
                    <p className="ac-panel-sub">
                      We sent a 6-digit code to<br />
                      <strong className="text-[#F07028]">{otpEmail}</strong>
                    </p>
                  </div>

                  <div className="ac-form" style={{ gap: 18 }}>
                    {/* OTP boxes */}
                    <div className="flex gap-2.5 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          className="w-[46px] h-14 rounded-xl bg-white/[0.06] text-[22px] font-extrabold text-center outline-none transition-[border-color,color] duration-200"
                          style={{
                            border: `1.5px solid ${digit ? "#F07028" : "rgba(255,255,255,0.12)"}`,
                            color: digit ? "#F07028" : "#fff",
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKey(i, e)}
                        />
                      ))}
                    </div>

                    <button className="ac-btn btn-shimmer" onClick={handleVerifyOtp} disabled={loading}>
                      {loading
                        ? <Spinner label="Verifying…" />
                        : <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Verify Email</span>
                      }
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[13px]">
                      <span className="text-white/40">Didn&apos;t get it?</span>
                      {canResend ? (
                        <button
                          className="flex items-center gap-1 bg-transparent border-none text-[#F07028] text-[13px] font-semibold cursor-pointer p-0 disabled:opacity-50"
                          onClick={handleResendOtp}
                          disabled={resending}
                        >
                          <RefreshCw size={13} />
                          {resending ? "Sending…" : "Resend OTP"}
                        </button>
                      ) : (
                        <span className="text-white/30">Resend in {countdown}s</span>
                      )}
                    </div>

                    <p className="text-[11px] text-white/[0.22] text-center leading-relaxed m-0">
                      Code expires in 10 minutes. Check spam if you don&apos;t see it.
                    </p>

                    <button
                      className="bg-transparent border-none text-white/35 text-[13px] cursor-pointer p-0"
                      onClick={() => { setOtpStep(false); setOtp(["", "", "", "", "", ""]); }}
                    >
                      ← Back to register
                    </button>
                  </div>
                </>
              ) : (
                /* ── Register fields ── */
                <>
                  <div className="ac-panel-top">
                    <div className="ac-avatar">
                      <img src="/images/logo.jpg" alt="Community" />
                    </div>
                    <h2 className="ac-panel-title">Create account</h2>
                    <p className="ac-panel-sub">Join the Community in seconds</p>
                  </div>

                  <form onSubmit={handleRegister} className="ac-form" noValidate>
                    <InputField
                      type="text"
                      placeholder="Full Name"
                      value={regData.name}
                      onChange={(e) => { setRegData((p) => ({ ...p, name: e.target.value })); touch("rname"); }}
                      icon={<User size={15} />}
                      touched={touched.rname}
                      valid={regData.name.trim().length >= 2}
                      autoComplete="name"
                    />

                    <InputField
                      type="email"
                      placeholder="Email address"
                      value={regData.email}
                      onChange={(e) => { setRegData((p) => ({ ...p, email: e.target.value })); touch("remail"); }}
                      icon={<Mail size={15} />}
                      touched={touched.remail}
                      valid={emailValid(regData.email)}
                      autoComplete="email"
                    />

                    {/* Password with strength */}
                    <div className="ac-pwd-wrap">
                      <div className={`ac-input-wrap${touched.rpwd && regData.password ? " ac-valid" : ""}`}>
                        <span className="ac-input-icon-left"><Lock size={15} /></span>
                        <input
                          className="ac-input"
                          type="password"
                          placeholder="Password"
                          value={regData.password}
                          onChange={(e) => { setRegData((p) => ({ ...p, password: e.target.value })); touch("rpwd"); }}
                          onFocus={() => setShowRules(true)}
                          onBlur={() => setShowRules(false)}
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      {regData.password && (
                        <div className="ac-strength">
                          <div className="ac-strength-bars">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="ac-strength-bar"
                                style={{ background: i <= strength ? S_COLOR[strength] : "rgba(255,255,255,0.08)" }}
                              />
                            ))}
                          </div>
                          <span className="ac-strength-label" style={{ color: S_COLOR[strength] }}>
                            {S_LABEL[strength]}
                          </span>
                        </div>
                      )}

                      {showRules && (
                        <div className="ac-rules">
                          {PWD_RULES.map((r, i) => {
                            const ok = r.test(regData.password);
                            return (
                              <div key={i} className={`ac-rule${ok ? " ok" : ""}`}>
                                {ok ? <Check size={11} /> : <div className="ac-rule-dot" />}
                                <span>{r.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className={`ac-input-wrap${
                      touched.rconfirm && regData.confirm
                        ? regData.password === regData.confirm ? " ac-valid" : " ac-invalid"
                        : ""
                    }`}>
                      <span className="ac-input-icon-left"><Lock size={15} /></span>
                      <input
                        className="ac-input"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={regData.confirm}
                        onChange={(e) => { setRegData((p) => ({ ...p, confirm: e.target.value })); touch("rconfirm"); }}
                        autoComplete="new-password"
                        required
                      />
                      <span className="ac-input-icon-right">
                        <button type="button" className="ac-eye-btn" onClick={() => setShowConfirm((v) => !v)}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </span>
                      {touched.rconfirm && regData.confirm && (
                        <span className="ac-input-status">
                          {regData.password === regData.confirm
                            ? <Check size={13} className="ac-check" />
                            : <X size={13} className="ac-cross" />}
                        </span>
                      )}
                    </div>

                    <button type="submit" className="ac-btn btn-shimmer" disabled={loading}>
                      {loading ? <Spinner label="Creating account…" /> : "Create Account"}
                    </button>

                    <Divider />

                    <button type="button" className="ac-google btn-shimmer" onClick={() => googleLogin()}>
                      <GoogleIcon />
                      Continue with Google
                    </button>

                    <p className="ac-switch">
                      Already have an account?{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); setToggled(false); }}>Sign In</a>
                    </p>
                  </form>
                </>
              )}

            </div>
          </div>

          {/* ════════ REGISTER WELCOME ════════ */}
          <div className="ac-welcome ac-wel-register">
            <div className="ac-welcome-inner">
              <div className="ac-welcome-logo">
                <img src="/images/logo.jpg" alt="Community" />
              </div>
              <h2 className="ac-welcome-title">JOIN THE<br />COMMUNITY!</h2>
              <p className="ac-welcome-sub">Protect your privacy.<br />Connect instantly. Stay safe.</p>

              <div className="ac-features">
                <FeatureCard icon={<QrCode size={16} />} label="Smart QR Code"    sub="Generated just for you" />
                <FeatureCard icon={<Shield size={16} />} label="Secure by Design" sub="Zero personal data in QR" />
                <FeatureCard icon={<Users size={16} />}  label="Community"        sub="Trusted by vehicle owners" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Shared small components ────────────────────────────────────────────
function Spinner({ label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
      </svg>
      {label}
    </span>
  );
}

function Divider() {
  return (
    <div className="ac-divider">
      <span>or continue with</span>
    </div>
  );
}
