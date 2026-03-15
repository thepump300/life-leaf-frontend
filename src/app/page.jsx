"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Download, Edit2, Car, ShieldAlert, Clock, LogOut,
  CheckCircle2, AlertTriangle, Droplets, MapPin,
  ParkingCircle, Siren, RefreshCw, ScanLine, X,
  Zap, Bell, ChevronRight, User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI, authAPI, incidentAPI, qrAPI, dashboardAPI } from "@/services/api";

const BASE_URL   = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const TYPE_LABEL = {
  parking:   "Parking Issue",
  accident:  "Accident / Emergency",
  lights_on: "Lights Left On",
  damage:    "Damage Noticed",
};
const TYPE_ICON  = {
  parking:   <ParkingCircle size={13} />,
  accident:  <Siren size={13} />,
  lights_on: <Zap size={13} />,
  damage:    <Bell size={13} />,
};
const TYPE_COLOR = {
  parking:   "#F07028",
  accident:  "#ef4444",
  lights_on: "#FFB347",
  damage:    "#a78bfa",
};

export default function DashboardPage() {
  const { loading } = useAuth();
  const router      = useRouter();
  const qrRef       = useRef(null);

  const [profile,        setProfile]        = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats,          setStats]          = useState(null);
  const [regenModal,     setRegenModal]     = useState(false);
  const [regenLoading,   setRegenLoading]   = useState(false);

  useEffect(() => {
    if (loading) return;
    profileAPI.getProfile()
      .then((d) => setProfile(d.user))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setProfileLoading(false));
    dashboardAPI.getStats()
      .then((d) => setStats(d.stats))
      .catch(() => {});
  }, [loading]);

  const handleRegenerate = async () => {
    setRegenLoading(true);
    try {
      await qrAPI.regenerate();
      toast.success("QR code regenerated. Your old sticker will no longer work.");
      const d = await profileAPI.getProfile();
      setProfile(d.user);
      setRegenModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleLogout = () => { authAPI.logout(); router.replace("/login"); };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href     = canvas.toDataURL("image/png");
    link.download = `qr-${profile.vehicleNumber || "community"}.png`;
    link.click();
  };

  if (loading || profileLoading) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-[#07050f] text-white font-sans">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #F07028, transparent 65%)", top: "-300px", left: "-200px" }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #5CE8D8, transparent 65%)", bottom: "-200px", right: "-100px" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 65%)", top: "40%", right: "20%" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.05] bg-[rgba(7,5,15,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-[1.5px] border-[rgba(240,112,40,0.5)] shadow-[0_0_12px_rgba(240,112,40,0.3)]">
            <img src="/images/logo.jpg" alt="Community" className="w-full h-full object-cover" />
          </div>
          <span className="text-[18px] font-black tracking-tight"
            style={{ background: "linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Community
          </span>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full py-1.5 px-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFB347] to-[#E8411A] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-[13px] text-white/60 font-medium hidden sm:block">{profile.name}</span>
            </div>
          )}
          <button
            className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors rounded-full text-white/50 py-[7px] px-4 text-[13px] cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={13} /><span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Regenerate QR Modal ── */}
      {regenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-5"
          onClick={() => setRegenModal(false)}>
          <div className="bg-[#111018] border border-white/[0.1] rounded-2xl p-7 max-w-[380px] w-full flex flex-col gap-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center">
                  <AlertTriangle size={18} color="#ef4444" />
                </div>
                <h3 className="text-base font-bold text-white">Regenerate QR?</h3>
              </div>
              <button className="bg-transparent border-none text-white/30 hover:text-white/60 cursor-pointer transition-colors"
                onClick={() => setRegenModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] text-white/45 leading-relaxed">
              Your current QR sticker will <span className="text-red-400 font-semibold">stop working immediately</span>. Anyone scanning it will see an error. You&apos;ll need to print and replace the sticker.
            </p>
            <div className="flex gap-2.5">
              <button className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/50 font-semibold text-sm py-2.5 px-4 cursor-pointer hover:bg-white/[0.08] transition-colors"
                onClick={() => setRegenModal(false)}>
                Cancel
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl text-white font-bold text-sm py-2.5 px-4 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.25)] disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)" }}
                onClick={handleRegenerate}
                disabled={regenLoading}
              >
                <RefreshCw size={13} className={regenLoading ? "animate-spin" : ""} />
                {regenLoading ? "Regenerating…" : "Yes, Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-[1] max-w-[1160px] mx-auto px-5 md:px-8 pb-20">

        {!profile?.profileCompleted ? (
          /* ── Incomplete profile banner ── */
          <div className="flex justify-center pt-24">
            <div className="max-w-[460px] w-full text-center bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] rounded-3xl py-14 px-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(240,112,40,0.1)] border border-[rgba(240,112,40,0.2)] flex items-center justify-center">
                <User size={30} color="#F07028" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Complete your profile</h2>
                <p className="text-sm text-white/40 leading-relaxed">
                  Add your vehicle details and emergency contacts to generate your personal QR sticker.
                </p>
              </div>
              <button
                className="mt-2 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-sm py-3 px-6 cursor-pointer shadow-[0_4px_24px_rgba(240,112,40,0.3)] transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)" }}
                onClick={() => router.push("/profile/setup")}
              >
                Set Up Profile <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Hero Strip ── */}
            <div className="pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5 font-medium">Dashboard</p>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Hey, {profile.name.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-white/35 mt-1">Your vehicle is protected and QR is live.</p>
              </div>
              <button
                className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] transition-colors rounded-xl text-white/55 py-2.5 px-4 text-sm font-medium cursor-pointer shrink-0"
                onClick={() => router.push("/profile/setup")}
              >
                <Edit2 size={13} /> Edit Profile
              </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard
                icon={<ScanLine size={20} />}
                label="Total Scans"
                value={stats?.scanCount ?? "0"}
                accent="#a78bfa"
                sub="QR scanned"
              />
              <StatCard
                icon={<Zap size={20} />}
                label="Open Reports"
                value={stats?.openReports ?? "0"}
                accent="#F07028"
                sub="Needs attention"
              />
              <StatCard
                icon={<CheckCircle2 size={20} />}
                label="Resolved"
                value={stats?.resolvedReports ?? "0"}
                accent="#22c55e"
                sub="Closed"
              />
              <StatCard
                icon={<ShieldAlert size={20} />}
                label="Safety Score"
                value={stats ? `${stats.safetyScore}%` : "—"}
                accent="#5CE8D8"
                sub="Profile strength"
              />
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">

              {/* ── Left: QR + Contacts ── */}
              <div className="flex flex-col gap-5">

                {/* QR Card */}
                <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] rounded-2xl p-6 flex flex-col gap-5">
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-white">Your QR Code</p>
                      <p className="text-xs text-white/35 mt-0.5">Stick on your vehicle windshield</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full py-1 px-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </div>
                  </div>

                  {/* Vehicle plate */}
                  <div className="flex items-center gap-2.5 bg-[rgba(240,112,40,0.07)] border border-[rgba(240,112,40,0.18)] rounded-xl py-2.5 px-4">
                    <Car size={14} color="#F07028" />
                    <span className="text-lg font-black tracking-[4px] text-[#F07028]">{profile.vehicleNumber}</span>
                  </div>

                  {/* QR code */}
                  <div className="flex justify-center" ref={qrRef}>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
                        style={{ background: "linear-gradient(135deg,#FFB347,#F07028)" }} />
                      <div className="relative bg-white rounded-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_8px_rgba(240,112,40,0.08)]">
                        <QRCodeCanvas
                          value={`${BASE_URL}/scan/${profile.qrId}`}
                          size={190}
                          bgColor="#ffffff"
                          fgColor="#0A0A0A"
                          level="H"
                          includeMargin
                        />
                      </div>
                    </div>
                  </div>

                  {/* URL hint */}
                  <p className="text-center text-[10px] text-white/20 font-mono truncate px-2">
                    {BASE_URL}/scan/{profile.qrId}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl text-white font-bold text-sm py-2.5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.25)] hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)" }}
                      onClick={downloadQR}
                    >
                      <Download size={13} /> Download PNG
                    </button>
                    <button
                      className="w-11 flex items-center justify-center bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] transition-colors rounded-xl text-white/40 cursor-pointer shrink-0"
                      onClick={() => setRegenModal(true)}
                      title="Regenerate QR"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                {/* Emergency Contacts Card */}
                {profile.emergencyContacts?.length > 0 && (
                  <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <ShieldAlert size={14} color="#F07028" />
                      <p className="text-[13px] font-bold text-white/80">Emergency Contacts</p>
                    </div>
                    {profile.emergencyContacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(240,112,40,0.15)] flex items-center justify-center text-sm font-bold text-[#F07028] shrink-0">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/85 truncate">{c.name}</p>
                          <p className="text-[11px] text-white/30 mt-0.5">••• ••• {c.phone?.slice(-4)}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Incident History ── */}
              <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-0 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[15px] font-bold text-white">Activity Feed</p>
                    <p className="text-xs text-white/35 mt-0.5">Reports from people who scanned your QR</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[rgba(240,112,40,0.1)] flex items-center justify-center">
                    <Bell size={15} color="#F07028" />
                  </div>
                </div>
                <IncidentList />
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── StatCard ── */
function StatCard({ icon, label, value, accent, sub }) {
  return (
    <div className="relative overflow-hidden bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] transition-colors rounded-2xl py-5 px-5 flex flex-col gap-3 cursor-default group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}08, transparent 60%)` }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-[1]"
        style={{ background: accent + "15", color: accent }}>
        {icon}
      </div>
      <div className="relative z-[1]">
        <p className="text-xl font-black" style={{ color: accent }}>{value}</p>
        <p className="text-[11px] font-semibold text-white/50 mt-0.5">{label}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── IncidentList ── */
function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    incidentAPI.getMyIncidents()
      .then((d) => setIncidents(d.incidents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await incidentAPI.resolve(id);
      setIncidents((prev) =>
        prev.map((inc) => inc._id === id ? { ...inc, status: "resolved" } : inc)
      );
      toast.success("Marked as resolved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResolving(null);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-[2.5px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
    </div>
  );

  if (!incidents.length) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-1">
        <CheckCircle2 size={28} color="#22c55e" />
      </div>
      <p className="text-base font-bold text-white/70">All clear</p>
      <p className="text-[13px] text-white/30 leading-relaxed max-w-[260px]">
        No incidents yet. Reports will appear here when someone scans your QR code.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col divide-y divide-white/[0.05]">
      {incidents.map((inc, idx) => (
        <div key={inc._id} className="flex gap-4 py-4 group">
          {/* Timeline dot */}
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
              style={{ borderColor: TYPE_COLOR[inc.type], backgroundColor: inc.status === "resolved" ? TYPE_COLOR[inc.type] : "transparent" }} />
            {idx < incidents.length - 1 && <div className="w-px flex-1 bg-white/[0.05] mt-1" />}
          </div>

          <div className="flex-1 flex flex-col gap-2.5 pb-1">
            {/* Top row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold rounded-lg py-1 px-2.5"
                style={{ color: TYPE_COLOR[inc.type], background: TYPE_COLOR[inc.type] + "15" }}>
                {TYPE_ICON[inc.type]}
                <span>{TYPE_LABEL[inc.type] || inc.type}</span>
              </div>

              {inc.status === "resolved" ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg py-1 px-2.5 capitalize">
                  ✓ Resolved
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#F07028] bg-[rgba(240,112,40,0.1)] border border-[rgba(240,112,40,0.2)] rounded-lg py-1 px-2.5">
                    Open
                  </span>
                  <button
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/25 rounded-lg py-1 px-2.5 cursor-pointer disabled:opacity-40 transition-colors"
                    onClick={() => handleResolve(inc._id)}
                    disabled={resolving === inc._id}
                  >
                    <CheckCircle2 size={11} />
                    {resolving === inc._id ? "Saving…" : "Resolve"}
                  </button>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <MapPin size={11} className="shrink-0" /> {inc.location || "Unknown location"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Clock size={11} className="shrink-0" /> {new Date(inc.timestamp).toLocaleString()}
              </span>
            </div>
            {inc.note && (
              <p className="text-[12px] text-white/40 bg-white/[0.03] rounded-lg px-3 py-2 italic leading-relaxed">
                &ldquo;{inc.note}&rdquo;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── FullPageLoader ── */
function FullPageLoader() {
  return (
    <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 rounded-full border-[2.5px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
      <p className="text-white/20 text-sm">Loading…</p>
    </div>
  );
}
