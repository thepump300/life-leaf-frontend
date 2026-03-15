"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

export default function ForgotPasswordPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06040e] flex items-center justify-center px-4 py-5 relative font-sans">
      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.10) 0%, transparent 60%)" }}
      />

      <div className="w-full max-w-[400px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-7 py-9 text-white flex flex-col items-center gap-5 relative z-[1] backdrop-blur-md">
        <button
          className="self-start flex items-center gap-1.5 bg-transparent border-none text-white/40 text-[13px] cursor-pointer p-0"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft size={14} /> Back to login
        </button>

        {sent ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] border border-[rgba(240,112,40,0.25)] flex items-center justify-center">
              <CheckCircle2 size={28} color="#22c55e" />
            </div>
            <h1 className="text-[22px] font-extrabold text-white m-0">Check your inbox</h1>
            <p className="text-sm text-white/50 text-center leading-relaxed m-0">
              If <strong className="text-[#F07028]">{email}</strong> is registered, a password reset link has been sent. It expires in 15 minutes.
            </p>
            <p className="text-xs text-white/25 text-center m-0">Check your spam folder if you don&apos;t see it.</p>
            <button
              className="w-full bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-[15px] py-3.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
              onClick={() => router.push("/login")}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] border border-[rgba(240,112,40,0.25)] flex items-center justify-center">
              <Mail size={28} color="#F07028" />
            </div>
            <h1 className="text-[22px] font-extrabold text-white m-0">Forgot password?</h1>
            <p className="text-sm text-white/50 text-center leading-relaxed m-0">
              Enter your registered email and we&apos;ll send a reset link.
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
              <div className="flex items-center bg-white/[0.06] border-[1.5px] border-white/10 rounded-xl overflow-hidden">
                <span className="px-3.5 flex items-center shrink-0">
                  <Mail size={15} color="rgba(255,255,255,0.4)" />
                </span>
                <input
                  className="flex-1 bg-transparent border-none text-white text-sm py-3.5 outline-none placeholder:text-white/25"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-[15px] py-3.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
