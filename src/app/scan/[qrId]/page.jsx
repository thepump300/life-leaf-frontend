"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { toast } from "sonner";
import {
  Car, MapPin, TriangleAlert, ParkingCircle, Siren,
  CheckCircle2, ArrowLeft, ChevronRight, Navigation,
  Phone, WifiOff,
} from "lucide-react";
import { qrAPI, incidentAPI } from "@/services/api";

export default function ScanPage({ params }) {
  const { qrId }    = use(params);
  const [vehicle,    setVehicle]   = useState(null);
  const [error,      setError]     = useState("");
  const [loading,    setLoading]   = useState(true);
  const [step,       setStep]      = useState("choose"); // choose | location | success
  const [selected,   setSelected]  = useState(null);
  const [location,   setLocation]  = useState("");
  const [gpsLoading, setGpsLoading]= useState(false);
  const [submitting, setSubmitting]= useState(false);
  const [isOffline,  setIsOffline] = useState(false);

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
    if (!navigator.geolocation) { toast.error("Geolocation not supported on this device"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setGpsLoading(false);
        toast.success("Location captured");
      },
      () => { setGpsLoading(false); toast.error("Couldn't get location. Type it manually."); },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await incidentAPI.report({ qrId, type: selected.key, location: location.trim() || "Unknown" });
      setStep("success");
    } catch (e) {
      toast.error(e.message.includes("Too many") ? "Too many reports. Try again later." : e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Offline ──
  if (isOffline) return (
    <Screen>
      <div className="w-full max-w-[440px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-6 py-7 text-white flex flex-col gap-4 relative z-[1] backdrop-blur-md">
        <div className="w-[72px] h-[72px] rounded-full bg-[rgba(239,68,68,0.10)] flex items-center justify-center mx-auto">
          <WifiOff size={36} color="#ef4444" />
        </div>
        <h2 className="text-[22px] font-extrabold text-center">No Internet</h2>
        <p className="text-sm text-white/40 text-center leading-[1.6]">You&apos;re offline. The report can&apos;t be submitted right now.</p>
        <a href="tel:112" className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#dc2626] to-[#ef4444] border-none rounded-[14px] text-white font-extrabold text-base py-4 cursor-pointer no-underline shadow-[0_8px_28px_rgba(239,68,68,0.4)]">
          <Phone size={18} /> Call 112 Emergency
        </a>
        <p className="text-[11px] text-white/[0.22] text-center leading-relaxed">Please call emergency services directly.</p>
      </div>
    </Screen>
  );

  if (loading) return <Screen><Loader /></Screen>;

  if (error || !vehicle) return (
    <Screen>
      <div className="flex flex-col items-center gap-3.5 text-center bg-white/[0.03] border border-[rgba(239,68,68,0.15)] rounded-3xl py-12 px-8 max-w-[360px] text-white relative z-[1]">
        <div className="w-[72px] h-[72px] rounded-full bg-[rgba(239,68,68,0.10)] flex items-center justify-center">
          <TriangleAlert size={36} color="#ef4444" />
        </div>
        <h2 className="text-[22px] font-extrabold">QR Not Found</h2>
        <p className="text-sm text-white/40 leading-relaxed">This QR code is invalid or has been removed.</p>
      </div>
    </Screen>
  );

  if (step === "success") return (
    <Screen>
      <div className="w-full max-w-[440px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-6 py-7 text-white flex flex-col gap-4 relative z-[1] backdrop-blur-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.12)] border-2 border-[rgba(34,197,94,0.25)] flex items-center justify-center">
            <CheckCircle2 size={40} color="#22c55e" />
          </div>
        </div>
        <h2 className="text-[24px] font-black text-[#22c55e] text-center">Report Sent!</h2>
        <p className="text-[13px] text-white/45 text-center leading-[1.7]">
          The vehicle owner has been notified. Thank you for keeping the community safe.
        </p>

        <div className="bg-white/[0.04] rounded-[14px] p-4 flex flex-col gap-3">
          <SummaryRow label="Incident" value={selected.label} color={selected.color} />
          <SummaryRow label="Vehicle"  value={vehicle.vehicleNumber} />
          <SummaryRow label="Location" value={location || "Unknown"} />
        </div>

        {selected.key === "accident" && (
          <a href="tel:112" className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#dc2626] to-[#ef4444] border-none rounded-[14px] text-white font-extrabold text-base py-4 cursor-pointer no-underline shadow-[0_8px_28px_rgba(239,68,68,0.4)]">
            <Phone size={16} /> Call 112 Emergency Services
          </a>
        )}

        <p className="text-[11px] text-white/[0.22] text-center">No personal data was shared with you.</p>
      </div>
    </Screen>
  );

  if (step === "location") return (
    <Screen>
      <div className="w-full max-w-[440px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-6 py-7 text-white flex flex-col gap-4 relative z-[1] backdrop-blur-md">
        {selected.key === "accident" && (
          <a href="tel:112" className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#dc2626] to-[#ef4444] border-none rounded-[14px] text-white font-extrabold text-base py-4 cursor-pointer no-underline shadow-[0_8px_28px_rgba(239,68,68,0.4)]">
            <Phone size={16} /> Call 112 Emergency Services
          </a>
        )}

        <button
          className="flex items-center gap-1.5 bg-transparent border-none text-white/40 text-[13px] cursor-pointer p-0"
          onClick={() => setStep("choose")}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div
          className="flex items-center gap-2 rounded-[10px] py-2.5 px-3.5"
          style={{ background: selected.color + "18", border: `1px solid ${selected.color}30` }}
        >
          {selected.icon}
          <span className="text-sm font-bold" style={{ color: selected.color }}>{selected.label}</span>
        </div>

        <VehiclePlate number={vehicle.vehicleNumber} />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <Navigation size={15} color="#F07028" />
            <span className="text-[13px] font-semibold text-white/65">Where is the vehicle?</span>
            <span className="text-[11px] text-white/[0.28] ml-0.5">(optional)</span>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/[0.06] border-[1.5px] border-white/10 rounded-xl text-white text-sm py-[13px] px-[15px] outline-none box-border placeholder:text-white/30"
              type="text"
              placeholder="e.g. Near Gate 2, Phoenix Mall"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoFocus
            />
            <button
              className="w-[46px] shrink-0 bg-[rgba(240,112,40,0.10)] border-[1.5px] border-[rgba(240,112,40,0.25)] rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
              onClick={captureGPS}
              disabled={gpsLoading}
              title="Use my location"
            >
              {gpsLoading
                ? <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[rgba(240,112,40,0.3)] border-t-[#F07028] animate-spin" />
                : <Navigation size={15} color="#F07028" />}
            </button>
          </div>
        </div>

        <button
          className="flex items-center justify-center gap-2 border-none rounded-[14px] text-white font-bold text-[15px] py-3.5 cursor-pointer w-full disabled:opacity-50"
          style={{
            background: selected.key === "accident"
              ? "linear-gradient(135deg,#dc2626,#ef4444)"
              : "linear-gradient(135deg,#FFB347,#F07028,#E8411A)",
            boxShadow: `0 8px 28px ${selected.color}40`,
          }}
          onClick={submit}
          disabled={submitting}
        >
          {submitting
            ? <><span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
            : <><span>Submit Report</span><ChevronRight size={16} /></>}
        </button>

        <p className="text-[11px] text-white/[0.22] text-center leading-relaxed">
          Your identity is not recorded. Only the location you provide will be shared with the vehicle owner.
        </p>
      </div>
    </Screen>
  );

  // ── Choose step ──
  return (
    <Screen>
      <div className="w-full max-w-[440px] bg-white/[0.04] border border-white/[0.09] rounded-3xl px-6 py-7 text-white flex flex-col gap-4 relative z-[1] backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <span
            className="text-[20px] font-black"
            style={{ background: "linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Community
          </span>
          <span className="text-[10px] font-bold text-white/30 bg-white/[0.06] border border-white/10 rounded-[20px] py-[3px] px-[9px] uppercase tracking-wide">
            QR Report
          </span>
        </div>

        <VehiclePlate number={vehicle.vehicleNumber} />

        <p className="text-sm font-semibold text-white/60 text-center">What do you want to report?</p>

        {/* Emergency */}
        <button
          className="flex items-center gap-3.5 bg-[rgba(239,68,68,0.06)] border-[1.5px] border-[rgba(239,68,68,0.25)] rounded-2xl p-4 cursor-pointer text-left text-white w-full"
          onClick={() => {
            setSelected({ key: "accident", label: "Accident / Emergency", color: "#ef4444", icon: <Siren size={18} color="#ef4444" /> });
            setStep("location");
          }}
        >
          <div className="w-12 h-12 rounded-[14px] bg-[rgba(239,68,68,0.15)] flex items-center justify-center shrink-0">
            <Siren size={24} color="#ef4444" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[15px] font-bold text-white">Accident / Emergency</span>
            <span className="text-xs text-white/40 leading-[1.4]">Urgent — vehicle involved in accident or emergency</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        </button>

        {/* Parking */}
        <button
          className="flex items-center gap-3.5 bg-white/[0.04] border-[1.5px] border-white/[0.08] rounded-2xl p-4 cursor-pointer text-left text-white w-full"
          onClick={() => {
            setSelected({ key: "parking", label: "Parking Issue", color: "#F07028", icon: <ParkingCircle size={18} color="#F07028" /> });
            setStep("location");
          }}
        >
          <div className="w-12 h-12 rounded-[14px] bg-[rgba(240,112,40,0.15)] flex items-center justify-center shrink-0">
            <ParkingCircle size={24} color="#F07028" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[15px] font-bold text-white">Parking Issue</span>
            <span className="text-xs text-white/40 leading-[1.4]">Vehicle blocking access or parked incorrectly</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        </button>

        <p className="text-[11px] text-white/[0.22] text-center leading-relaxed">
          🔒 Your identity is not recorded. No personal information is shared with you.
        </p>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-[#06040e] flex items-center justify-center px-4 py-5 relative overflow-hidden font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.12) 0%, transparent 60%)" }}
      />
      {children}
    </div>
  );
}

function VehiclePlate({ number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2.5 bg-[rgba(240,112,40,0.08)] border-[1.5px] border-[rgba(240,112,40,0.25)] rounded-[14px] py-3 px-6 w-full justify-center">
        <Car size={16} color="#F07028" />
        <span className="text-[26px] font-black tracking-[5px] text-[#F07028]">{number}</span>
      </div>
      <span className="text-[11px] text-white/[0.28] tracking-wide">Registered Vehicle</span>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/35">{label}</span>
      <span className="text-[13px] font-bold" style={{ color: color || "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="w-9 h-9 rounded-full border-[3px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
      <p className="text-[13px] text-white/35">Looking up vehicle…</p>
    </div>
  );
}
