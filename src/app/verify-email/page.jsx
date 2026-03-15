"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06040e]" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const email       = params.get("email") || "";

  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs   = useRef([]);

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
    <div className="min-h-screen bg-[#06040e] flex items-center justify-center px-4 py-5 relative font-sans">
      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.10) 0%, transparent 60%)" }}
      />

      <div className="w-full max-w-[420px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-7 py-9 text-white flex flex-col items-center gap-5 relative z-[1] backdrop-blur-md">
        <button
          className="self-start flex items-center gap-1.5 bg-transparent border-none text-white/40 text-[13px] cursor-pointer p-0"
          onClick={() => router.push("/register")}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] border border-[rgba(240,112,40,0.25)] flex items-center justify-center">
          <Mail size={28} color="#F07028" />
        </div>

        <h1 className="text-[22px] font-extrabold text-white m-0">Check your email</h1>
        <p className="text-sm text-white/50 text-center leading-relaxed m-0">
          We sent a 6-digit code to<br />
          <strong className="text-[#F07028]">{email || "your email"}</strong>
        </p>

        {/* OTP Boxes */}
        <div className="flex gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
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
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          className="w-full bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-[15px] py-3.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2"><Spinner /> Verifying…</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Verify Email</span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-white/40">Didn&apos;t get it?</span>
          {canResend ? (
            <button
              className="flex items-center gap-1 bg-transparent border-none text-[#F07028] text-[13px] font-semibold cursor-pointer p-0 disabled:opacity-50"
              onClick={handleResend}
              disabled={resending}
            >
              <RefreshCw size={13} />
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          ) : (
            <span className="text-[13px] text-white/30">Resend in {countdown}s</span>
          )}
        </div>

        <p className="text-[11px] text-white/[0.22] text-center leading-relaxed m-0">
          The code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
    </svg>
  );
}
