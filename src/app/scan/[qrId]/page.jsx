"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { toast } from "sonner";
import {
  Car, MapPin, TriangleAlert, ArrowLeft, ChevronRight, Navigation,
  Phone, WifiOff, Lightbulb, Wrench, MessageSquare,
  Shield, Clock, CheckCircle2, Siren, ParkingCircle, Droplets,
  AlertCircle,
} from "lucide-react";
import { qrAPI, incidentAPI } from "@/services/api";

const INCIDENT_TYPES = [
  {
    key:    "accident",
    label:  "Accident / Emergency",
    sub:    "Vehicle involved in crash or emergency",
    icon:   Siren,
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    urgent: true,
  },
  {
    key:    "parking",
    label:  "Parking Issue",
    sub:    "Blocking access or parked incorrectly",
    icon:   ParkingCircle,
    color:  "#F07028",
    bg:     "rgba(240,112,40,0.07)",
    border: "rgba(240,112,40,0.18)",
    urgent: false,
  },
  {
    key:    "lights_on",
    label:  "Lights Left On",
    sub:    "Headlights or interior lights still on",
    icon:   Lightbulb,
    color:  "#FFB347",
    bg:     "rgba(255,179,71,0.07)",
    border: "rgba(255,179,71,0.18)",
    urgent: false,
  },
  {
    key:    "damage",
    label:  "Damage Noticed",
    sub:    "Scratch, dent, or hit-and-run observed",
    icon:   Wrench,
    color:  "#a78bfa",
    bg:     "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.18)",
    urgent: false,
  },
];

export default function ScanPage({ params }) {
  const { qrId }     = use(params);
  const [vehicle,    setVehicle]    = useState(null);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState("choose");
  const [selected,   setSelected]   = useState(null);
  const [location,   setLocation]   = useState("");
  const [note,       setNote]       = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOffline,  setIsOffline]  = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online",  update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online",  update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    qrAPI.getByQrId(qrId)
      .then(({ data }) => setVehicle(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [qrId]);

  const captureGPS = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setGpsLoading(false);
        toast.success("Location captured");
      },
      () => { setGpsLoading(false); toast.error("Couldn't detect location. Enter manually."); },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await incidentAPI.report({ qrId, type: selected.key, location: location.trim() || "Unknown", note: note.trim() });
      setStep("success");
    } catch (e) {
      toast.error(e.message.includes("Too many") ? "Too many reports. Try again later." : e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Offline ──────────────────────────────────────────────────────────
  if (isOffline) return (
    <Shell>
      <style>{STYLES}</style>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.2)" }}>
          <WifiOff size={32} color="#ef4444" />
        </div>
        <div>
          <h2 className="text-[22px] font-black text-white">You're offline</h2>
          <p className="text-[13px] text-white/35 mt-2 leading-relaxed">Reports can't be submitted without internet.<br />If this is an emergency, call 112 directly.</p>
        </div>
        <EmergencyBtn />
      </div>
    </Shell>
  );

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <Shell>
      <style>{STYLES}</style>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[2.5px] border-[rgba(240,112,40,0.12)] border-t-[#F07028] animate-spin" />
        <p className="text-[13px] text-white/30">Looking up vehicle…</p>
      </div>
    </Shell>
  );

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !vehicle) return (
    <Shell>
      <style>{STYLES}</style>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.18)" }}>
          <TriangleAlert size={32} color="#ef4444" />
        </div>
        <div>
          <h2 className="text-[22px] font-black text-white">Sticker Replaced</h2>
          <p className="text-[13px] text-white/35 mt-2 leading-relaxed">
            The owner has replaced this sticker with a newer one. This QR is no longer active.
          </p>
          <p className="text-[12px] text-white/20 mt-3">If this is an emergency, call 112 directly.</p>
        </div>
        <EmergencyBtn />
      </div>
    </Shell>
  );

  // ── Success ───────────────────────────────────────────────────────────
  if (step === "success") return (
    <Shell>
      <style>{STYLES}</style>
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-6 pop-in">

        {/* Check */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background:"rgba(34,197,94,0.1)", border:"2px solid rgba(34,197,94,0.25)" }}>
            <CheckCircle2 size={38} color="#22c55e" />
          </div>
          <div>
            <h2 className="text-[28px] font-black text-white">Report sent!</h2>
            <p className="text-[13px] text-white/35 mt-1.5 leading-relaxed">
              The owner has been notified instantly via email.
            </p>
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08]"
          style={{ background:"rgba(255,255,255,0.03)" }}>
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Report Summary</p>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.05]">
            <SummaryRow label="Incident" value={selected.label} color={selected.color} />
            <SummaryRow label="Vehicle"  value={vehicle.vehicleNumber} />
            <SummaryRow label="Location" value={location || "Not provided"} />
            {note && <SummaryRow label="Note" value={note} />}
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4"
          style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">What happens next</p>
          <div className="flex flex-col gap-3.5">
            {[
              { icon: Clock,        text: "Owner receives an email alert immediately",      done: true  },
              { icon: Shield,       text: "Emergency contacts notified if provided",         done: true  },
              { icon: CheckCircle2, text: "Owner reviews and marks the report as resolved",  done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: item.done ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)" }}>
                  <item.icon size={13} color={item.done ? "#22c55e" : "rgba(255,255,255,0.2)"} />
                </div>
                <p className="text-[12px] text-white/40 leading-relaxed mt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {selected.urgent && <EmergencyBtn />}

        <p className="text-[11px] text-white/18 text-center">Your identity was not recorded.</p>
      </div>
    </Shell>
  );

  // ── Details step ──────────────────────────────────────────────────────
  if (step === "details") return (
    <Shell>
      <style>{STYLES}</style>
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-5 slide-up">

        {/* Back */}
        <button className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-[13px] cursor-pointer transition-colors self-start"
          onClick={() => setStep("choose")}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Emergency banner */}
        {selected.urgent && (
          <div className="rounded-2xl overflow-hidden border border-red-500/20"
            style={{ background:"rgba(239,68,68,0.07)" }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <AlertCircle size={16} color="#ef4444" className="shrink-0" />
              <p className="text-[12px] text-red-400/80 leading-relaxed flex-1">
                If anyone is injured, <strong className="text-red-400">call 112 immediately</strong> before submitting.
              </p>
            </div>
            <EmergencyBtn compact />
          </div>
        )}

        {/* Selected type badge */}
        <div className="flex items-center gap-3.5 rounded-2xl px-4 py-4"
          style={{ background: selected.bg, border:`1.5px solid ${selected.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background:`${selected.color}20`, color: selected.color }}>
            <selected.icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: selected.color }}>{selected.label}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{selected.sub}</p>
          </div>
        </div>

        {/* Vehicle */}
        <PlateDisplay vehicle={vehicle} />

        {/* Location */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-white/25 uppercase tracking-widest">
            Location <span className="font-normal normal-case tracking-normal text-white/15">· optional</span>
          </label>
          <div className="flex gap-2">
            <input
              className="inp flex-1"
              type="text"
              placeholder="e.g. Near Gate 2, Phoenix Mall"
              value={location}
              onChange={e => setLocation(e.target.value)}
              autoFocus
            />
            <button
              className="w-12 shrink-0 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
              style={{ background:"rgba(240,112,40,0.1)", border:"1.5px solid rgba(240,112,40,0.22)" }}
              onClick={captureGPS}
              disabled={gpsLoading}
              title="Detect my location">
              {gpsLoading
                ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[rgba(240,112,40,0.3)] border-t-[#F07028] animate-spin" />
                : <Navigation size={15} color="#F07028" />}
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-white/25 uppercase tracking-widest">
            Note <span className="font-normal normal-case tracking-normal text-white/15">· optional</span>
          </label>
          <textarea
            className="inp resize-none leading-relaxed"
            rows={3}
            placeholder="Any additional details you noticed…"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={300}
          />
          {note && <p className="text-[10px] text-white/18 self-end">{note.length}/300</p>}
        </div>

        {/* Submit */}
        <button
          className="flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-[15px] py-4 w-full cursor-pointer disabled:opacity-40 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: selected.urgent
              ? "linear-gradient(135deg,#dc2626,#ef4444)"
              : "linear-gradient(135deg,#FFB347,#F07028,#E8411A)",
            boxShadow: `0 8px 28px ${selected.color}30`,
          }}
          onClick={submit}
          disabled={submitting}>
          {submitting
            ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
            : <>Submit Report <ChevronRight size={16} /></>}
        </button>

        <p className="text-[11px] text-white/18 text-center">Your identity is not recorded or shared.</p>
      </div>
    </Shell>
  );

  // ── Choose step ───────────────────────────────────────────────────────
  return (
    <Shell>
      <style>{STYLES}</style>
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-6 slide-up">

        {/* Header */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-[15px] font-black"
            style={{ background:"linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Community
          </span>
          <p className="text-[12px] text-white/25">QR Vehicle Report</p>
        </div>

        {/* Vehicle plate */}
        <PlateDisplay vehicle={vehicle} prominent />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.06)" }} />
          <p className="text-[11px] text-white/25 font-medium">What happened?</p>
          <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.06)" }} />
        </div>

        {/* Incident types */}
        <div className="flex flex-col gap-2.5">
          {INCIDENT_TYPES.map((type) => (
            <button key={type.key}
              className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer text-left w-full transition-all hover:brightness-110 active:scale-[0.985]"
              style={{ background: type.bg, border:`1.5px solid ${type.border}` }}
              onClick={() => { setSelected(type); setStep("details"); }}>
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                style={{ background:`${type.color}18`, color: type.color }}>
                <type.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-white">{type.label}</p>
                  {type.urgent && (
                    <span className="text-[9px] font-black text-red-400 bg-red-400/10 border border-red-400/22 rounded-full px-2 py-0.5 uppercase tracking-wide shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{type.sub}</p>
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.15)" className="shrink-0" />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-white/18 text-center">Anonymous — your identity is never recorded.</p>
      </div>
    </Shell>
  );
}

/* ── Shared components ──────────────────────────────────────────────── */

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#07050f] text-white flex items-center justify-center px-5 py-10 relative overflow-hidden font-sans">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.06]"
          style={{ background:"radial-gradient(ellipse,#F07028,transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] opacity-[0.04]"
          style={{ background:"radial-gradient(ellipse,#5CE8D8,transparent 65%)" }} />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

function PlateDisplay({ vehicle, prominent }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${prominent ? "py-2" : ""}`}>
      <div className="flex items-center gap-3 rounded-2xl px-7 py-4 w-full justify-center"
        style={{ background:"rgba(240,112,40,0.08)", border:"1.5px solid rgba(240,112,40,0.22)" }}>
        <Car size={prominent ? 18 : 14} color="#F07028" />
        <span style={{
          fontSize: prominent ? "28px" : "22px",
          fontWeight: 900,
          letterSpacing: "5px",
          color: "#F07028",
        }}>
          {vehicle.vehicleNumber}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-white/22">Registered Vehicle</span>
        {vehicle.bloodGroup && (
          <>
            <span className="text-white/12">·</span>
            <div className="flex items-center gap-1.5">
              <Droplets size={10} color="#5CE8D8" />
              <span className="text-[11px] font-black text-[#5CE8D8]">{vehicle.bloodGroup}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmergencyBtn({ compact }) {
  return (
    <a href="tel:112"
      className={`flex items-center justify-center gap-2.5 rounded-xl text-white font-black no-underline transition-opacity hover:opacity-90 ${compact ? "py-3 mx-4 mb-4 text-[13px]" : "py-4 w-full text-[15px]"}`}
      style={{ background:"linear-gradient(135deg,#dc2626,#ef4444)", boxShadow:"0 8px 24px rgba(239,68,68,0.3)" }}>
      <Phone size={compact ? 14 : 18} /> Call 112 — Emergency Services
    </a>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-start gap-4 px-5 py-3.5">
      <span className="text-[11px] text-white/25 shrink-0 mt-0.5">{label}</span>
      <span className="text-[13px] font-semibold text-right leading-relaxed"
        style={{ color: color || "rgba(255,255,255,0.75)" }}>
        {value}
      </span>
    </div>
  );
}

const STYLES = `
  .inp {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    color: #fff;
    font-size: 14px;
    padding: 13px 16px;
    outline: none;
    transition: all 0.2s;
  }
  .inp:focus {
    border-color: rgba(240,112,40,0.45);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 4px rgba(240,112,40,0.07);
  }
  .inp::placeholder { color: rgba(255,255,255,0.18); }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  .slide-up { animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .pop-in   { animation: popIn  0.4s cubic-bezier(0.22,1,0.36,1) both; }
`;
