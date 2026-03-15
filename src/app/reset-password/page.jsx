"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06040e]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") || "";
  const email   = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#06040e] flex items-center justify-center px-4 py-5 relative font-sans">
        <div className="w-full max-w-[400px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-7 py-9 text-white flex flex-col items-center gap-5 relative z-[1] backdrop-blur-md">
          <p className="text-red-500 text-center">Invalid or expired reset link. Please request a new one.</p>
          <button
            className="w-full bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-[15px] py-3.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
            onClick={() => router.push("/forgot-password")}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm)  { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const data = await authAPI.resetPassword({ token, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setDone(true);
      setTimeout(() => router.push("/"), 1500);
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
        {done ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] border border-[rgba(240,112,40,0.25)] flex items-center justify-center">
              <CheckCircle2 size={28} color="#22c55e" />
            </div>
            <h1 className="text-[22px] font-extrabold text-white m-0">Password updated!</h1>
            <p className="text-sm text-white/50 text-center leading-relaxed m-0">Redirecting you to your dashboard…</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] border border-[rgba(240,112,40,0.25)] flex items-center justify-center">
              <Lock size={28} color="#F07028" />
            </div>
            <h1 className="text-[22px] font-extrabold text-white m-0">Set new password</h1>
            <p className="text-sm text-white/50 text-center leading-relaxed m-0">
              Choose a strong password for <strong className="text-[#F07028]">{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
              {/* New password */}
              <div className="flex items-center bg-white/[0.06] border-[1.5px] border-white/10 rounded-xl overflow-hidden">
                <span className="px-3.5 flex items-center shrink-0">
                  <Lock size={15} color="rgba(255,255,255,0.4)" />
                </span>
                <input
                  className="flex-1 bg-transparent border-none text-white text-sm py-3.5 outline-none placeholder:text-white/25"
                  type={showPwd ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="bg-transparent border-none text-white/40 px-3.5 flex items-center cursor-pointer"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="flex items-center bg-white/[0.06] border-[1.5px] border-white/10 rounded-xl overflow-hidden">
                <span className="px-3.5 flex items-center shrink-0">
                  <Lock size={15} color="rgba(255,255,255,0.4)" />
                </span>
                <input
                  className="flex-1 bg-transparent border-none text-white text-sm py-3.5 outline-none placeholder:text-white/25"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {password && confirm && (
                <p className={`text-xs m-0 ${password === confirm ? "text-green-500" : "text-red-500"}`}>
                  {password === confirm ? "Passwords match" : "Passwords do not match"}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-[15px] py-3.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
