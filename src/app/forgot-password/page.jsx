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
    <div style={S.page}>
      <div style={S.glow} />

      <div style={S.card}>
        <button style={S.backBtn} onClick={() => router.push("/login")}>
          <ArrowLeft size={14} /> Back to login
        </button>

        {sent ? (
          <>
            <div style={S.iconWrap}><CheckCircle2 size={28} color="#22c55e" /></div>
            <h1 style={S.title}>Check your inbox</h1>
            <p style={S.sub}>
              If <strong style={{ color: "#F07028" }}>{email}</strong> is registered, a password reset link has been sent. It expires in 15 minutes.
            </p>
            <p style={S.note}>Check your spam folder if you don't see it.</p>
            <button style={S.btn} onClick={() => router.push("/login")}>Back to Sign In</button>
          </>
        ) : (
          <>
            <div style={S.iconWrap}><Mail size={28} color="#F07028" /></div>
            <h1 style={S.title}>Forgot password?</h1>
            <p style={S.sub}>Enter your registered email and we'll send a reset link.</p>

            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}><Mail size={15} color="rgba(255,255,255,0.4)" /></span>
                <input
                  style={S.input}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
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

  backBtn: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.38)", fontSize: 13, cursor: "pointer", padding: 0 },

  iconWrap: { width: 64, height: 64, borderRadius: "50%", background: "rgba(240,112,40,0.12)", border: "1px solid rgba(240,112,40,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },

  title: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, margin: 0 },
  note: { fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 },

  form: { width: "100%", display: "flex", flexDirection: "column", gap: 14 },
  inputWrap: { display: "flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.10)", borderRadius: 12, overflow: "hidden" },
  inputIcon: { padding: "0 14px", display: "flex", alignItems: "center", flexShrink: 0 },
  input: { flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 14, padding: "13px 14px 13px 0", outline: "none" },

  btn: { width: "100%", background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px", cursor: "pointer", boxShadow: "0 4px 20px rgba(240,112,40,0.3)" },
};
