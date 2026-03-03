"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { toast } from "sonner";
import {
  Car, MapPin, TriangleAlert, ParkingCircle, Siren,
  CheckCircle2, ArrowLeft, ChevronRight, Navigation,
} from "lucide-react";
import { qrAPI, incidentAPI } from "@/services/api";

export default function ScanPage({ params }) {
  const { qrId }    = use(params);
  const [vehicle, setVehicle]       = useState(null);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(true);
  const [step, setStep]             = useState("choose");   // choose | location | success
  const [selected, setSelected]     = useState(null);
  const [location, setLocation]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    qrAPI.getByQrId(qrId)
      .then(({ data }) => setVehicle(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [qrId]);

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

  if (loading) return <Screen><Loader /></Screen>;

  if (error || !vehicle) return (
    <Screen>
      <div style={S.errorBox}>
        <div style={S.errorIconWrap}><TriangleAlert size={36} color="#ef4444" /></div>
        <h2 style={S.errorTitle}>QR Not Found</h2>
        <p style={S.errorSub}>This QR code is invalid or has been removed.</p>
      </div>
    </Screen>
  );

  if (step === "success") return (
    <Screen>
      <div style={S.card}>
        <div style={S.successRing}>
          <div style={S.successInner}><CheckCircle2 size={40} color="#22c55e" /></div>
        </div>
        <h2 style={S.successTitle}>Report Sent!</h2>
        <p style={S.successSub}>The vehicle owner has been notified. Thank you for keeping the community safe.</p>

        <div style={S.summaryCard}>
          <SummaryRow label="Incident" value={selected.label} color={selected.color} />
          <SummaryRow label="Vehicle"  value={vehicle.vehicleNumber} />
          <SummaryRow label="Location" value={location || "Unknown"} />
        </div>
        <p style={S.successNote}>No personal data was shared with you.</p>
      </div>
    </Screen>
  );

  if (step === "location") return (
    <Screen>
      <div style={S.card}>
        <button style={S.backBtn} onClick={() => setStep("choose")}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ ...S.selectedBadge, background: selected.color + "18", border: `1px solid ${selected.color}30` }}>
          {selected.icon}
          <span style={{ ...S.selectedLabel, color: selected.color }}>{selected.label}</span>
        </div>

        <VehiclePlate number={vehicle.vehicleNumber} />

        <div style={S.locationBox}>
          <div style={S.locationHeader}>
            <Navigation size={15} color="#F07028" />
            <span style={S.locationTitle}>Where is the vehicle?</span>
            <span style={S.locationOptional}>(optional)</span>
          </div>
          <input
            style={S.locationInput}
            type="text"
            placeholder="e.g. Near Gate 2, Phoenix Mall, Andheri West"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoFocus
          />
        </div>

        <button
          style={{ ...S.reportBtn, background: selected.key === "accident" ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", boxShadow: `0 8px 28px ${selected.color}40` }}
          onClick={submit}
          disabled={submitting}
        >
          {submitting
            ? <span style={S.btnLoader}><span style={S.btnSpinner} /> Submitting…</span>
            : <><span>Submit Report</span><ChevronRight size={16} /></>}
        </button>

        <p style={S.locationDisclaimer}>
          Your identity is not recorded. Only the location you provide will be shared with the vehicle owner.
        </p>
      </div>
    </Screen>
  );

  // ── Choose step ──
  return (
    <Screen>
      <div style={S.card}>
        {/* Brand */}
        <div style={S.brand}>
          <span style={S.brandName}>Community</span>
          <span style={S.brandTag}>QR Report</span>
        </div>

        <VehiclePlate number={vehicle.vehicleNumber} />

        <p style={S.choosePrompt}>What do you want to report?</p>

        {/* Parking */}
        <button style={{ ...S.typeBtn, ...S.parkingBtn }} onClick={() => { setSelected({ key: "parking", label: "Parking Issue", color: "#F07028", icon: <ParkingCircle size={18} color="#F07028" /> }); setStep("location"); }}>
          <div style={{ ...S.typeBtnIcon, background: "rgba(240,112,40,0.15)" }}>
            <ParkingCircle size={24} color="#F07028" />
          </div>
          <div style={S.typeBtnText}>
            <span style={S.typeBtnTitle}>Parking Issue</span>
            <span style={S.typeBtnSub}>Vehicle blocking access or parked incorrectly</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        </button>

        {/* Emergency */}
        <button style={{ ...S.typeBtn, ...S.emergencyBtn }} onClick={() => { setSelected({ key: "accident", label: "Accident / Emergency", color: "#ef4444", icon: <Siren size={18} color="#ef4444" /> }); setStep("location"); }}>
          <div style={{ ...S.typeBtnIcon, background: "rgba(239,68,68,0.15)" }}>
            <Siren size={24} color="#ef4444" />
          </div>
          <div style={S.typeBtnText}>
            <span style={S.typeBtnTitle}>Accident / Emergency</span>
            <span style={S.typeBtnSub}>Urgent — vehicle involved in accident or emergency</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        </button>

        <p style={S.disclaimer}>
          🔒 Your identity is not recorded. No personal information is shared with you.
        </p>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div style={S.page}>
      <div style={S.glow} />
      {children}
    </div>
  );
}

function VehiclePlate({ number }) {
  return (
    <div style={S.plate}>
      <div style={S.plateInner}>
        <Car size={16} color="#F07028" />
        <span style={S.plateNum}>{number}</span>
      </div>
      <span style={S.plateSub}>Registered Vehicle</span>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={S.summaryRow}>
      <span style={S.summaryLabel}>{label}</span>
      <span style={{ ...S.summaryValue, color: color || "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={S.loaderSpinner} />
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Looking up vehicle…</p>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#06040e", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "var(--font-geist-sans), sans-serif", position: "relative", overflow: "hidden" },
  glow: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(240,112,40,0.12) 0%, transparent 60%)", pointerEvents: "none" },

  card: { width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "28px 24px", color: "#fff", display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 1, backdropFilter: "blur(12px)" },

  /* Brand */
  brand: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  brandName: { fontSize: 20, fontWeight: 900, background: "linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  brandTag: { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: "3px 9px", textTransform: "uppercase", letterSpacing: 1 },

  /* Vehicle plate */
  plate: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
  plateInner: { display: "flex", alignItems: "center", gap: 10, background: "rgba(240,112,40,0.08)", border: "1.5px solid rgba(240,112,40,0.25)", borderRadius: 14, padding: "12px 24px", width: "100%", justifyContent: "center" },
  plateNum: { fontSize: 26, fontWeight: 900, letterSpacing: 5, color: "#F07028" },
  plateSub: { fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: 1 },

  /* Choose */
  choosePrompt: { fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", textAlign: "center" },
  typeBtn: { display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", cursor: "pointer", textAlign: "left", color: "#fff", transition: "border-color 0.2s, background 0.2s", width: "100%" },
  parkingBtn: {},
  emergencyBtn: {},
  typeBtnIcon: { width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  typeBtnText: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  typeBtnTitle: { fontSize: 15, fontWeight: 700, color: "#fff" },
  typeBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 },
  disclaimer: { fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.6 },

  /* Back */
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.38)", fontSize: 13, cursor: "pointer", padding: 0 },

  /* Selected badge */
  selectedBadge: { display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "10px 14px" },
  selectedLabel: { fontSize: 14, fontWeight: 700 },

  /* Location */
  locationBox: { display: "flex", flexDirection: "column", gap: 10 },
  locationHeader: { display: "flex", alignItems: "center", gap: 7 },
  locationTitle: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" },
  locationOptional: { fontSize: 11, color: "rgba(255,255,255,0.28)", marginLeft: 2 },
  locationInput: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.10)", borderRadius: 12, color: "#fff", fontSize: 14, padding: "13px 15px", outline: "none", boxSizing: "border-box" },
  reportBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px", cursor: "pointer", width: "100%" },
  btnLoader: { display: "flex", alignItems: "center", gap: 8 },
  btnSpinner: { display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  locationDisclaimer: { fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.6 },

  /* Success */
  successRing: { display: "flex", justifyContent: "center" },
  successInner: { width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },
  successTitle: { textAlign: "center", fontSize: 24, fontWeight: 900, color: "#22c55e" },
  successSub: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 },
  summaryCard: { background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "16px", display: "flex", flexDirection: "column", gap: 12 },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 12, color: "rgba(255,255,255,0.35)" },
  summaryValue: { fontSize: 13, fontWeight: 700 },
  successNote: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.22)" },

  /* Error */
  errorBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 24, padding: "48px 32px", maxWidth: 360, color: "#fff", position: "relative", zIndex: 1 },
  errorIconWrap: { width: 72, height: 72, borderRadius: "50%", background: "rgba(239,68,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center" },
  errorTitle: { fontSize: 22, fontWeight: 800 },
  errorSub: { fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 },

  /* Loader */
  loaderSpinner: { width: 36, height: 36, border: "3px solid rgba(240,112,40,0.15)", borderTop: "3px solid #F07028", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};
