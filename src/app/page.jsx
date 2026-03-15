"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Download, Edit2, Car, ShieldAlert, Clock, LogOut,
  CheckCircle2, AlertTriangle, Droplets, MapPin,
  ParkingCircle, Siren, ChevronRight,
  RefreshCw, ScanLine, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI, authAPI, incidentAPI, qrAPI, dashboardAPI } from "@/services/api";

const BASE_URL   = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const TYPE_LABEL = { parking: "Parking Issue", accident: "Accident / Emergency" };
const TYPE_ICON  = { parking: <ParkingCircle size={14} />, accident: <Siren size={14} /> };
const TYPE_COLOR = { parking: "#F07028", accident: "#ef4444" };
const STATUS_BG  = { open: "rgba(240,112,40,0.15)", resolved: "rgba(34,197,94,0.12)" };
const STATUS_CLR = { open: "#F07028", resolved: "#22c55e" };

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
    <div className="min-h-screen bg-[#06040e] text-white font-sans relative overflow-hidden">
      {/* Glows */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(240,112,40,0.12), transparent 70%)", top: -200, left: -200 }}
      />
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(92,232,216,0.06), transparent 70%)", bottom: -150, right: -150 }}
      />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3.5 border-b border-white/[0.06] bg-[rgba(6,4,14,0.85)] backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-full overflow-hidden border-[1.5px] border-[rgba(240,112,40,0.4)]">
            <img src="/images/logo.jpg" alt="Community" className="w-full h-full object-cover" />
          </div>
          <span
            className="text-[17px] font-extrabold"
            style={{ background: "linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Community
          </span>
        </div>
        <div className="flex items-center gap-4">
          {profile && (
            <div className="flex items-center gap-[9px]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB347] to-[#E8411A] flex items-center justify-center text-[13px] font-bold text-white">
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-[13px] text-white/65 font-medium">{profile.name}</span>
            </div>
          )}
          <button
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-white/50 py-[7px] px-3.5 text-[13px] cursor-pointer transition-all duration-200 hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut size={14} /><span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Regenerate QR Modal ── */}
      {regenModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-5"
          onClick={() => setRegenModal(false)}
        >
          <div
            className="bg-[#111018] border border-white/10 rounded-[20px] p-7 max-w-[380px] w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white m-0">Regenerate QR Code?</h3>
              <button className="bg-transparent border-none text-white/40 cursor-pointer flex items-center p-1" onClick={() => setRegenModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] text-white/50 leading-[1.7] m-0">
              Your current QR sticker will stop working immediately. Anyone who scans it will see an error. You&apos;ll need to print and stick a new sticker.
            </p>
            <div className="flex gap-2.5">
              <button
                className="bg-white/[0.05] border border-white/10 rounded-xl text-white/60 font-semibold text-sm py-[11px] px-[18px] cursor-pointer"
                onClick={() => setRegenModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[11px] px-5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)] disabled:opacity-50"
                onClick={handleRegenerate}
                disabled={regenLoading}
              >
                {regenLoading ? "Regenerating…" : "Yes, Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1100px] mx-auto px-6 pt-9 pb-[60px] relative z-[1]">
        {!profile?.profileCompleted ? (
          /* ── Incomplete profile ── */
          <div className="flex justify-center pt-20">
            <div className="max-w-[440px] text-center bg-white/[0.03] border border-white/[0.08] rounded-3xl py-12 px-10 flex flex-col items-center gap-3.5">
              <div className="w-16 h-16 rounded-full bg-[rgba(240,112,40,0.12)] flex items-center justify-center">
                <AlertTriangle size={32} color="#F07028" />
              </div>
              <h2 className="text-[22px] font-extrabold text-white">Set up your profile</h2>
              <p className="text-sm text-white/45 leading-[1.7]">
                Add your vehicle details and emergency contacts to generate your personal QR code.
              </p>
              <button
                className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[11px] px-5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
                onClick={() => router.push("/profile/setup")}
              >
                Complete Profile <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Greeting ── */}
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[13px] text-white/40 mb-1">Welcome back</p>
                <h1 className="text-[28px] font-extrabold text-white m-0">{profile.name} 👋</h1>
              </div>
              <button
                className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-[10px] text-white/60 py-[9px] px-4 text-[13px] font-medium cursor-pointer"
                onClick={() => router.push("/profile/setup")}
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-4 gap-3.5 mb-6">
              <StatCard icon={<Car size={18} color="#F07028" />}         label="Vehicle"     value={profile.vehicleNumber}                            accent="#F07028" />
              <StatCard icon={<Droplets size={18} color="#5CE8D8" />}    label="Blood Group" value={profile.bloodGroup || "—"}                        accent="#5CE8D8" />
              <StatCard icon={<ScanLine size={18} color="#a78bfa" />}    label="Total Scans" value={stats?.scanCount ?? "—"}                          accent="#a78bfa" />
              <StatCard icon={<ShieldAlert size={18} color="#22c55e" />} label="Contacts"    value={`${profile.emergencyContacts?.length || 0} saved`} accent="#22c55e" />
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-[380px_1fr] gap-5 items-start">

              {/* ── QR Card ── */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col gap-[18px]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[15px] font-bold text-white mb-[3px]">Your QR Code</p>
                    <p className="text-xs text-white/40">Scan to report an issue anonymously</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#22c55e] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] rounded-[20px] py-[3px] px-2.5">
                    ● Live
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-[rgba(240,112,40,0.08)] border border-[rgba(240,112,40,0.2)] rounded-[10px] py-2.5 px-3.5">
                  <Car size={14} color="#F07028" />
                  <span className="text-[20px] font-extrabold tracking-[3px] text-[#F07028]">{profile.vehicleNumber}</span>
                </div>

                <div className="flex justify-center" ref={qrRef}>
                  <div className="bg-white rounded-2xl p-2 shadow-[0_0_0_6px_rgba(240,112,40,0.12),0_20px_60px_rgba(0,0,0,0.5)]">
                    <QRCodeCanvas
                      value={`${BASE_URL}/scan/${profile.qrId}`}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0A0A0A"
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[11px] px-5 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
                    onClick={downloadQR}
                  >
                    <Download size={14} /> Download QR
                  </button>
                  <button
                    className="w-10 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl text-white/50 cursor-pointer shrink-0"
                    onClick={() => setRegenModal(true)}
                    title="Regenerate QR code"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* Emergency contacts */}
                {profile.emergencyContacts?.length > 0 && (
                  <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-2.5">
                    <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wide mb-1">Emergency Contacts</p>
                    {profile.emergencyContacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-[10px] py-2.5 px-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(240,112,40,0.2)] flex items-center justify-center text-[13px] font-bold text-[#F07028] shrink-0">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white/85 m-0">{c.name}</p>
                          <p className="text-[11px] text-white/35 mt-0.5">••• ••• {c.phone?.slice(-4)}</p>
                        </div>
                        <ShieldAlert size={14} color="#F07028" className="ml-auto" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Incident History ── */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6">
                <div className="flex items-start justify-between mb-[22px]">
                  <div>
                    <p className="text-[15px] font-bold text-white mb-1">Incident History</p>
                    <p className="text-xs text-white/35">Reports submitted by people who scanned your QR</p>
                  </div>
                  <Clock size={18} color="#F07028" />
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

function StatCard({ icon, label, value, accent = "#F07028" }) {
  return (
    <div className="flex items-center gap-3.5 bg-white/[0.04] border border-white/[0.07] rounded-[14px] py-4 px-5">
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: accent + "18" }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-wide mb-[3px]">{label}</p>
        <p className="text-base font-bold m-0" style={{ color: accent }}>{value}</p>
      </div>
    </div>
  );
}

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
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-[3px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
    </div>
  );

  if (!incidents.length) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <CheckCircle2 size={40} color="#22c55e" />
      <p className="text-base font-bold text-white/70">All clear!</p>
      <p className="text-[13px] text-white/35 leading-relaxed max-w-[280px]">
        No incidents reported yet. When someone scans your QR, reports will appear here.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col">
      {incidents.map((inc) => (
        <div key={inc._id} className="flex gap-3.5 py-3.5 border-b border-white/[0.05]">
          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: TYPE_COLOR[inc.type] }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-1 text-xs font-semibold rounded-md py-[3px] px-[9px]"
                style={{ color: TYPE_COLOR[inc.type], background: TYPE_COLOR[inc.type] + "18" }}
              >
                {TYPE_ICON[inc.type]}
                <span>{TYPE_LABEL[inc.type] || inc.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-semibold rounded-md py-[3px] px-[9px] capitalize"
                  style={{ background: STATUS_BG[inc.status], color: STATUS_CLR[inc.status] }}
                >
                  {inc.status}
                </span>
                {inc.status === "open" && (
                  <button
                    className="flex items-center gap-1 bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.2)] rounded-md text-[#22c55e] text-[11px] font-semibold py-[3px] px-2 cursor-pointer disabled:opacity-50"
                    onClick={() => handleResolve(inc._id)}
                    disabled={resolving === inc._id}
                  >
                    <CheckCircle2 size={11} />
                    {resolving === inc._id ? "…" : "Resolve"}
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-white/35"><MapPin size={11} /> {inc.location}</span>
              <span className="flex items-center gap-1 text-[11px] text-white/35"><Clock size={11} /> {new Date(inc.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-[#06040e] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-[3px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
    </div>
  );
}
