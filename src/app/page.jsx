"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Download, Edit2, Car, ShieldAlert, Clock, LogOut,
  CheckCircle2, AlertTriangle, Droplets, MapPin,
  ParkingCircle, Siren, User, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI, authAPI, incidentAPI } from "@/services/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const TYPE_LABEL = { parking: "Parking Issue", accident: "Accident / Emergency" };
const TYPE_ICON  = { parking: <ParkingCircle size={14} />, accident: <Siren size={14} /> };
const TYPE_COLOR = { parking: "#F07028", accident: "#ef4444" };
const STATUS_BG  = { open: "rgba(240,112,40,0.15)", resolved: "rgba(34,197,94,0.12)" };
const STATUS_CLR = { open: "#F07028", resolved: "#22c55e" };

export default function DashboardPage() {
  const { loading }   = useAuth();
  const router        = useRouter();
  const qrRef         = useRef(null);

  const [profile, setProfile]               = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    profileAPI.getProfile()
      .then((d) => setProfile(d.user))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setProfileLoading(false));
  }, [loading]);

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
    <div style={S.root}>
      {/* ── Background glow ── */}
      <div style={S.glowA} />
      <div style={S.glowB} />

      {/* ── Navbar ── */}
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.navLogo}>
            <img src="/images/logo.jpg" alt="Community" style={S.navLogoImg} />
          </div>
          <span style={S.navBrand}>Community</span>
        </div>
        <div style={S.navRight}>
          {profile && (
            <div style={S.navUser}>
              <div style={S.navAvatar}>{profile.name?.[0]?.toUpperCase()}</div>
              <span style={S.navName}>{profile.name}</span>
            </div>
          )}
          <button onClick={handleLogout} style={S.logoutBtn}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main style={S.main}>
        {!profile?.profileCompleted ? (
          /* ── Incomplete profile ── */
          <div style={S.incompleteWrap}>
            <div style={S.incompleteCard}>
              <div style={S.incompleteIcon}><AlertTriangle size={32} color="#F07028" /></div>
              <h2 style={S.incompleteTitle}>Set up your profile</h2>
              <p style={S.incompleteSub}>
                Add your vehicle details and emergency contacts to generate your personal QR code.
              </p>
              <button style={S.orangeBtn} onClick={() => router.push("/profile/setup")}>
                Complete Profile <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Greeting ── */}
            <div style={S.greeting}>
              <div>
                <p style={S.greetSub}>Welcome back</p>
                <h1 style={S.greetName}>{profile.name} 👋</h1>
              </div>
              <button style={S.editBtn} onClick={() => router.push("/profile/setup")}>
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>

            {/* ── Stats row ── */}
            <div style={S.statsRow}>
              <StatCard icon={<Car size={18} color="#F07028" />}      label="Vehicle"     value={profile.vehicleNumber} />
              <StatCard icon={<Droplets size={18} color="#5CE8D8" />}  label="Blood Group" value={profile.bloodGroup || "—"} accent="#5CE8D8" />
              <StatCard icon={<ShieldAlert size={18} color="#a78bfa" />} label="Contacts"  value={`${profile.emergencyContacts?.length || 0} saved`} accent="#a78bfa" />
            </div>

            {/* ── Main grid ── */}
            <div style={S.grid}>

              {/* ── QR Card ── */}
              <div style={S.qrCard}>
                <div style={S.qrCardTop}>
                  <div>
                    <p style={S.qrCardLabel}>Your QR Code</p>
                    <p style={S.qrCardSub}>Scan to report an issue anonymously</p>
                  </div>
                  <span style={S.qrLiveBadge}>● Live</span>
                </div>

                <div style={S.qrPlate}>
                  <Car size={14} color="#F07028" />
                  <span style={S.qrPlateNum}>{profile.vehicleNumber}</span>
                </div>

                <div style={S.qrFrame} ref={qrRef}>
                  <div style={S.qrInner}>
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

                <div style={S.qrActions}>
                  <button style={S.orangeBtn} onClick={downloadQR}>
                    <Download size={14} /> Download QR
                  </button>
                </div>

                {/* Emergency contacts */}
                {profile.emergencyContacts?.length > 0 && (
                  <div style={S.contactsSection}>
                    <p style={S.contactsHeading}>Emergency Contacts</p>
                    {profile.emergencyContacts.map((c, i) => (
                      <div key={i} style={S.contactRow}>
                        <div style={S.contactAvatar}>{c.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p style={S.contactName}>{c.name}</p>
                          <p style={S.contactPhone}>••• ••• {c.phone?.slice(-4)}</p>
                        </div>
                        <ShieldAlert size={14} color="#F07028" style={{ marginLeft: "auto" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Incident History ── */}
              <div style={S.historyCard}>
                <div style={S.historyHeader}>
                  <div>
                    <p style={S.historyTitle}>Incident History</p>
                    <p style={S.historySub}>Reports submitted by people who scanned your QR</p>
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
    <div style={S.statCard}>
      <div style={{ ...S.statIcon, background: accent + "18" }}>{icon}</div>
      <div>
        <p style={S.statLabel}>{label}</p>
        <p style={{ ...S.statValue, color: accent }}>{value}</p>
      </div>
    </div>
  );
}

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    incidentAPI.getMyIncidents()
      .then((d) => setIncidents(d.incidents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={S.incidentEmpty}>
      <div style={{ ...S.miniSpinner }} />
    </div>
  );

  if (!incidents.length) return (
    <div style={S.incidentEmpty}>
      <CheckCircle2 size={40} color="#22c55e" />
      <p style={S.emptyTitle}>All clear!</p>
      <p style={S.emptySub}>No incidents reported yet. When someone scans your QR, reports will appear here.</p>
    </div>
  );

  return (
    <div style={S.incidentList}>
      {incidents.map((inc, i) => (
        <div key={inc._id} style={S.incidentRow}>
          <div style={{ ...S.incidentDot, background: TYPE_COLOR[inc.type] }} />
          <div style={S.incidentBody}>
            <div style={S.incidentTopRow}>
              <div style={{ ...S.incidentTypeBadge, color: TYPE_COLOR[inc.type], background: TYPE_COLOR[inc.type] + "18" }}>
                {TYPE_ICON[inc.type]}
                <span>{TYPE_LABEL[inc.type] || inc.type}</span>
              </div>
              <span style={{ ...S.statusBadge, background: STATUS_BG[inc.status], color: STATUS_CLR[inc.status] }}>
                {inc.status}
              </span>
            </div>
            <div style={S.incidentMeta}>
              <span style={S.incidentMetaItem}><MapPin size={11} /> {inc.location}</span>
              <span style={S.incidentMetaItem}><Clock size={11} /> {new Date(inc.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FullPageLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#06040e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={S.miniSpinner} />
    </div>
  );
}

/* ── Styles ── */
const S = {
  root: { minHeight: "100vh", background: "#06040e", color: "#fff", fontFamily: "var(--font-geist-sans), sans-serif", position: "relative", overflow: "hidden" },
  glowA: { position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,112,40,0.12), transparent 70%)", top: -200, left: -200, pointerEvents: "none", zIndex: 0 },
  glowB: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(92,232,216,0.06), transparent 70%)", bottom: -150, right: -150, pointerEvents: "none", zIndex: 0 },

  /* Nav */
  nav: { position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,4,14,0.85)", backdropFilter: "blur(16px)" },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navLogo: { width: 30, height: 30, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(240,112,40,0.4)" },
  navLogoImg: { width: "100%", height: "100%", objectFit: "cover" },
  navBrand: { fontSize: 17, fontWeight: 800, background: "linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  navUser: { display: "flex", alignItems: "center", gap: 9 },
  navAvatar: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#FFB347,#E8411A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" },
  navName: { fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, color: "rgba(255,255,255,0.5)", padding: "7px 14px", fontSize: 13, cursor: "pointer", transition: "all 0.2s" },

  /* Main */
  main: { maxWidth: 1100, margin: "0 auto", padding: "36px 24px 60px", position: "relative", zIndex: 1 },

  /* Greeting */
  greeting: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 },
  greetSub: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 },
  greetName: { fontSize: 28, fontWeight: 800, color: "#fff", margin: 0 },
  editBtn: { display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.6)", padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" },

  /* Stats */
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 },
  statCard: { display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px" },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  statValue: { fontSize: 16, fontWeight: 700 },

  /* Grid */
  grid: { display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" },

  /* QR Card */
  qrCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 18 },
  qrCardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  qrCardLabel: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 },
  qrCardSub: { fontSize: 12, color: "rgba(255,255,255,0.38)" },
  qrLiveBadge: { fontSize: 11, fontWeight: 600, color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "3px 10px" },
  qrPlate: { display: "flex", alignItems: "center", gap: 8, background: "rgba(240,112,40,0.08)", border: "1px solid rgba(240,112,40,0.2)", borderRadius: 10, padding: "10px 14px" },
  qrPlateNum: { fontSize: 20, fontWeight: 800, letterSpacing: 3, color: "#F07028" },
  qrFrame: { display: "flex", justifyContent: "center" },
  qrInner: { background: "#fff", borderRadius: 16, padding: 8, boxShadow: "0 0 0 6px rgba(240,112,40,0.12), 0 20px 60px rgba(0,0,0,0.5)" },
  qrActions: { display: "flex", gap: 10 },

  /* Contacts */
  contactsSection: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 },
  contactsHeading: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  contactRow: { display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" },
  contactAvatar: { width: 32, height: 32, borderRadius: "50%", background: "rgba(240,112,40,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#F07028", flexShrink: 0 },
  contactName: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" },
  contactPhone: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 },

  /* History card */
  historyCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 },
  historyHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 },
  historyTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 },
  historySub: { fontSize: 12, color: "rgba(255,255,255,0.35)" },

  /* Incidents */
  incidentList: { display: "flex", flexDirection: "column", gap: 0 },
  incidentRow: { display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  incidentDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0 },
  incidentBody: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  incidentTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  incidentTypeBadge: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 9px" },
  statusBadge: { fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "3px 9px", textTransform: "capitalize" },
  incidentMeta: { display: "flex", gap: 14, flexWrap: "wrap" },
  incidentMetaItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.35)" },

  /* Empty / loader */
  incidentEmpty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0", textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)" },
  emptySub: { fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: 280 },

  /* Incomplete */
  incompleteWrap: { display: "flex", justifyContent: "center", paddingTop: 80 },
  incompleteCard: { maxWidth: 440, textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  incompleteIcon: { width: 64, height: 64, borderRadius: "50%", background: "rgba(240,112,40,0.12)", display: "flex", alignItems: "center", justifyContent: "center" },
  incompleteTitle: { fontSize: 22, fontWeight: 800, color: "#fff" },
  incompleteSub: { fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 },

  /* Shared */
  orangeBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 20px", cursor: "pointer", boxShadow: "0 4px 20px rgba(240,112,40,0.3)" },
  miniSpinner: { width: 32, height: 32, border: "3px solid rgba(240,112,40,0.15)", borderTop: "3px solid #F07028", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};
