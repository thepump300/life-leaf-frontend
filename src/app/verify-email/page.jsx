"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06040e" }} />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get("email") || "";

  const [otp,        setOtp]        = useState(["", "", "", "", "", ""]);
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [countdown,  setCountdown]  = useState(30);
  const [canResend,  setCanResend]  = useState(false);
  const inputRefs    = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (i, val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const data = await authAPI.verifyEmail({ email, otp: code });
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

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await authAPI.resendOTP(email);
      toast.success("New OTP sent to your email");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(30);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.glow} />

      <div style={S.card}>
        <button style={S.backBtn} onClick={() => router.push("/register")}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={S.iconWrap}>
          <Mail size={28} color="#F07028" />
        </div>

        <h1 style={S.title}>Check your email</h1>
        <p style={S.sub}>
          We sent a 6-digit code to<br />
          <strong style={{ color: "#F07028" }}>{email || "your email"}</strong>
        </p>

        {/* OTP Boxes */}
        <div style={S.otpRow} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              style={{
                ...S.otpBox,
                borderColor: digit ? "#F07028" : "rgba(255,255,255,0.12)",
                color: digit ? "#F07028" : "#fff",
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button style={S.verifyBtn} onClick={handleVerify} disabled={loading}>
          {loading ? (
            <span style={S.btnInner}><Spinner /> Verifying…</span>
          ) : (
            <span style={S.btnInner}><CheckCircle2 size={16} /> Verify Email</span>
          )}
        </button>

        <div style={S.resendRow}>
          <span style={S.resendLabel}>Didn't get it?</span>
          {canResend ? (
            <button style={S.resendBtn} onClick={handleResend} disabled={resending}>
              <RefreshCw size={13} />
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          ) : (
            <span style={S.countdownText}>Resend in {countdown}s</span>
          )}
        </div>

        <p style={S.note}>
          The code expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
    </svg>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#06040e", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "var(--font-geist-sans), sans-serif", position: "relative" },
  glow: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.10) 0%, transparent 60%)", pointerEvents: "none" },

  card: { width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "36px 28px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", zIndex: 1, backdropFilter: "blur(12px)" },

  backBtn: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.38)", fontSize: 13, cursor: "pointer", padding: 0 },

  iconWrap: { width: 64, height: 64, borderRadius: "50%", background: "rgba(240,112,40,0.12)", border: "1px solid rgba(240,112,40,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },

  title: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, margin: 0 },

  otpRow: { display: "flex", gap: 10 },
  otpBox: { width: 46, height: 56, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1.5px solid", fontSize: 22, fontWeight: 800, textAlign: "center", outline: "none", transition: "border-color 0.2s, color 0.2s", fontFamily: "inherit" },

  verifyBtn: { width: "100%", background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px", cursor: "pointer", boxShadow: "0 4px 20px rgba(240,112,40,0.3)" },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },

  resendRow: { display: "flex", alignItems: "center", gap: 8 },
  resendLabel: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  resendBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "#F07028", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 },
  countdownText: { fontSize: 13, color: "rgba(255,255,255,0.3)" },

  note: { fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.6, margin: 0 },
};
