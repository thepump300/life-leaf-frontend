"use client";

import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function BrandLogo() {
  return (
    <div className="ac-brand">
      <div className="ac-logo-wrap">
        <img src="/images/logo.jpg" alt="Community" className="ac-logo-img" />
      </div>
    </div>
  );
}

export default function AuthPage({ defaultMode = "login" }) {
  const [toggled, setToggled]         = useState(defaultMode === "register");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData]     = useState({ name: "", email: "", password: "", confirm: "" });

  const strength = getStrength(regData.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    toast.success("Login successful");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    toast.success("Account created!");
  };

  return (
    <div className="ac-page">
      <div className="ac-card-wrap">
      <div className={`ac-card${toggled ? " toggled" : ""}`}>

        {/* ── Diagonal orange panel ──────────────────────────────── */}
        <div className="ac-shape" />
        <div className="ac-shape2" />

        {/* ════ LOGIN FORM ════ */}
        <div className="ac-panel ac-login">
          <h2>Welcome back</h2>
          <form onSubmit={handleLogin}>
            <div className="ac-field">
              <input type="email" placeholder=" " required
                value={loginData.email}
                onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} />
              <label>Email address</label>
              <Mail size={15} className="ac-icon" />
            </div>
            <div className="ac-field">
              <input type={showPass ? "text" : "password"} placeholder=" " required
                value={loginData.password}
                onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                style={{ paddingRight: 28 }} />
              <label>Password</label>
              <button type="button" className="ac-eye" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div style={{ textAlign: "right", marginTop: -4, marginBottom: 20 }}>
              <a href="#" className="ac-forgot">Forgot password?</a>
            </div>
            <button type="submit" className="ac-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <div className="ac-divider"><span>or continue with</span></div>
            <button type="button" className="ac-google">
              <GoogleIcon />
              Continue with Google
            </button>
            <p className="ac-switch">
              Don&apos;t have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setToggled(true); }}>Sign Up</a>
            </p>
          </form>
        </div>

        {/* ════ LOGIN WELCOME ════ */}
        <div className="ac-welcome ac-wel-login">
          <BrandLogo />
          <h2>WELCOME<br />BACK!</h2>
          <p>Sign in to manage your<br />vehicle QR identity.</p>
          <div className="ac-tags">
            <span>QR Identity</span>
            <span>Privacy First</span>
            <span>Instant Connect</span>
          </div>
        </div>

        {/* ════ REGISTER FORM ════ */}
        <div className="ac-panel ac-register">
          <h2>Create account</h2>
          <form onSubmit={handleRegister}>
            <div className="ac-field">
              <input type="text" placeholder=" " required
                value={regData.name}
                onChange={e => setRegData(p => ({ ...p, name: e.target.value }))} />
              <label>Full Name</label>
              <User size={15} className="ac-icon" />
            </div>
            <div className="ac-field">
              <input type="email" placeholder=" " required
                value={regData.email}
                onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
              <label>Email address</label>
              <Mail size={15} className="ac-icon" />
            </div>
            <div className="ac-field" style={{ marginBottom: regData.password ? 30 : 18 }}>
              <input type="password" placeholder=" " required
                value={regData.password}
                onChange={e => setRegData(p => ({ ...p, password: e.target.value }))} />
              <label>Password</label>
              <Lock size={15} className="ac-icon" />
              {regData.password && (
                <div style={{ position: "absolute", bottom: -20, left: 0, right: 0 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 2, borderRadius: 2,
                        background: i <= strength ? S_COLOR[strength] : "rgba(255,255,255,0.10)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: S_COLOR[strength], marginTop: 3, display: "block" }}>
                    {S_LABEL[strength]} password
                  </span>
                </div>
              )}
            </div>
            <div className="ac-field">
              <input type={showConfirm ? "text" : "password"} placeholder=" " required
                value={regData.confirm}
                onChange={e => setRegData(p => ({ ...p, confirm: e.target.value }))}
                style={{ paddingRight: 28 }} />
              <label>Confirm Password</label>
              <button type="button" className="ac-eye" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div style={{ marginTop: 14 }}>
              <button type="submit" className="ac-btn" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </div>
            <div className="ac-divider"><span>or continue with</span></div>
            <button type="button" className="ac-google">
              <GoogleIcon />
              Continue with Google
            </button>
            <p className="ac-switch">
              Already have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setToggled(false); }}>Sign In</a>
            </p>
          </form>
        </div>

        {/* ════ REGISTER WELCOME ════ */}
        <div className="ac-welcome ac-wel-register">
          <BrandLogo />
          <h2>JOIN THE<br />COMMUNITY!</h2>
          <p>Protect privacy.<br />Connect instantly.</p>
          <div className="ac-tags">
            <span>Smart QR</span>
            <span>Secure</span>
            <span>Community</span>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
