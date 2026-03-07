"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06040e" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") || "";
  const email   = params.get("email") || "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  if (!token || !email) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={{ color: "#ef4444", textAlign: "center" }}>Invalid or expired reset link. Please request a new one.</p>
          <button style={S.btn} onClick={() => router.push("/forgot-password")}>Request New Link</button>
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
    <div style={S.page}>
      <div style={S.glow} />

      <div style={S.card}>
        {done ? (
          <>
            <div style={S.iconWrap}><CheckCircle2 size={28} color="#22c55e" /></div>
            <h1 style={S.title}>Password updated!</h1>
            <p style={S.sub}>Redirecting you to your dashboard…</p>
          </>
        ) : (
          <>
            <div style={S.iconWrap}><Lock size={28} color="#F07028" /></div>
            <h1 style={S.title}>Set new password</h1>
            <p style={S.sub}>Choose a strong password for <strong style={{ color: "#F07028" }}>{email}</strong></p>

            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}><Lock size={15} color="rgba(255,255,255,0.4)" /></span>
                <input
                  style={S.input}
                  type={showPwd ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div style={S.inputWrap}>
                <span style={S.inputIcon}><Lock size={15} color="rgba(255,255,255,0.4)" /></span>
                <input
                  style={S.input}
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {password && confirm && (
                <p style={{ fontSize: 12, color: password === confirm ? "#22c55e" : "#ef4444", margin: 0 }}>
                  {password === confirm ? "Passwords match" : "Passwords do not match"}
                </p>
              )}

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#06040e", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "var(--font-geist-sans), sans-serif", position: "relative" },
  glow: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.10) 0%, transparent 60%)", pointerEvents: "none" },

  card: { width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "36px 28px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", zIndex: 1, backdropFilter: "blur(12px)" },

  iconWrap: { width: 64, height: 64, borderRadius: "50%", background: "rgba(240,112,40,0.12)", border: "1px solid rgba(240,112,40,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },

  title: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, margin: 0 },

  form: { width: "100%", display: "flex", flexDirection: "column", gap: 14 },
  inputWrap: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.10)", borderRadius: 12, overflow: "hidden" },
  inputIcon: { padding: "0 14px", display: "flex", alignItems: "center", flexShrink: 0 },
  input: { flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 14, padding: "13px 14px 13px 0", outline: "none" },
  eyeBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center" },

  btn: { width: "100%", background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px", cursor: "pointer", boxShadow: "0 4px 20px rgba(240,112,40,0.3)" },
};
