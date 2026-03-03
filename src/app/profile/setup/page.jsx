"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Car, Phone, Droplets, ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI } from "@/services/api";

const BLOOD_GROUPS  = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const EMPTY_CONTACT = { name: "", phone: "" };

const STEPS = ["Vehicle Info", "Emergency Contacts", "Review"];

export default function ProfileSetupPage() {
  const { loading } = useAuth();
  const router      = useRouter();

  const [isEdit, setIsEdit]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep]         = useState(0);

  const [form, setForm] = useState({
    name:              "",
    vehicleNumber:     "",
    bloodGroup:        "",
    emergencyContacts: [{ ...EMPTY_CONTACT }],
  });

  useEffect(() => {
    if (loading) return;
    profileAPI.getProfile()
      .then(({ user }) => {
        if (user.profileCompleted) {
          setIsEdit(true);
          setForm({
            name:              user.name || "",
            vehicleNumber:     user.vehicleNumber || "",
            bloodGroup:        user.bloodGroup || "",
            emergencyContacts: user.emergencyContacts?.length > 0 ? user.emergencyContacts : [{ ...EMPTY_CONTACT }],
          });
        } else {
          setForm((f) => ({ ...f, name: user.name || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [loading]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setContact = (i, key, val) => {
    const c = [...form.emergencyContacts];
    c[i]    = { ...c[i], [key]: val };
    set("emergencyContacts", c);
  };

  const handleSubmit = async () => {
    if (!form.emergencyContacts[0]?.name || !form.emergencyContacts[0]?.phone) {
      toast.error("At least one emergency contact is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:              form.name.trim(),
        vehicleNumber:     form.vehicleNumber.trim().toUpperCase(),
        bloodGroup:        form.bloodGroup || undefined,
        emergencyContacts: form.emergencyContacts.filter((c) => c.name.trim() && c.phone.trim()),
      };
      if (isEdit) {
        await profileAPI.update(payload);
        toast.success("Profile updated!");
      } else {
        await profileAPI.setup(payload);
        toast.success("QR code generated! You're all set.");
      }
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return (
    <div style={S.page}><div style={S.spinner} /></div>
  );

  return (
    <div style={S.page}>
      <div style={S.glowA} />

      <div style={S.container}>
        {/* ── Back ── */}
        <button style={S.backBtn} onClick={() => router.push("/")}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        <div style={S.layout}>
          {/* ── Left: Form ── */}
          <div style={S.formSide}>
            {/* Progress steps */}
            <div style={S.steps}>
              {STEPS.map((label, i) => (
                <div key={i} style={S.stepWrap} onClick={() => i < step + 1 && setStep(i)}>
                  <div style={{
                    ...S.stepCircle,
                    background: i < step ? "#22c55e" : i === step ? "#F07028" : "rgba(255,255,255,0.08)",
                    border: i === step ? "2px solid #F07028" : i < step ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.12)",
                    cursor: i < step ? "pointer" : "default",
                  }}>
                    {i < step ? <CheckCircle2 size={14} color="#fff" /> : <span style={S.stepNum}>{i + 1}</span>}
                  </div>
                  <span style={{ ...S.stepLabel, color: i === step ? "#fff" : "rgba(255,255,255,0.35)" }}>{label}</span>
                  {i < STEPS.length - 1 && (
                    <div style={{ ...S.stepLine, background: i < step ? "#22c55e" : "rgba(255,255,255,0.08)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Vehicle Info ── */}
            {step === 0 && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardIconWrap}><Car size={20} color="#F07028" /></div>
                  <div>
                    <h2 style={S.cardTitle}>Vehicle Details</h2>
                    <p style={S.cardSub}>Enter your vehicle registration information</p>
                  </div>
                </div>

                <div style={S.fields}>
                  <FormField label="Your Name" icon={<User size={15} />}>
                    <input style={S.input} type="text" placeholder="Full name" value={form.name}
                      onChange={(e) => set("name", e.target.value)} />
                  </FormField>

                  <FormField label="Vehicle Number *" icon={<Car size={15} />}>
                    <input style={{ ...S.input, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}
                      type="text" placeholder="e.g. MH12AB1234" value={form.vehicleNumber}
                      onChange={(e) => set("vehicleNumber", e.target.value.toUpperCase())} required />
                  </FormField>

                  <FormField label="Blood Group (optional)" icon={<Droplets size={15} />}>
                    <select style={{ ...S.input, cursor: "pointer" }} value={form.bloodGroup}
                      onChange={(e) => set("bloodGroup", e.target.value)}>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FormField>
                </div>

                <button style={S.nextBtn}
                  onClick={() => { if (!form.vehicleNumber.trim()) { toast.error("Vehicle number required"); return; } setStep(1); }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 1: Emergency Contacts ── */}
            {step === 1 && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardIconWrap}><Phone size={20} color="#F07028" /></div>
                  <div>
                    <h2 style={S.cardTitle}>Emergency Contacts</h2>
                    <p style={S.cardSub}>Who should be notified in case of an incident?</p>
                  </div>
                </div>

                <div style={S.fields}>
                  {form.emergencyContacts.map((c, idx) => (
                    <div key={idx} style={S.contactBlock}>
                      <div style={S.contactBlockHeader}>
                        <div style={S.contactBadge}>Contact {idx + 1}{idx === 0 ? " *" : ""}</div>
                        {idx > 0 && (
                          <button style={S.removeBtn} type="button"
                            onClick={() => set("emergencyContacts", form.emergencyContacts.filter((_, i) => i !== idx))}>
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                      <input style={S.input} type="text" placeholder="Contact name"
                        value={c.name} onChange={(e) => setContact(idx, "name", e.target.value)} required={idx === 0} />
                      <input style={{ ...S.input, marginTop: 8 }} type="tel" placeholder="+91 98765 43210"
                        value={c.phone} onChange={(e) => setContact(idx, "phone", e.target.value)} required={idx === 0} />
                    </div>
                  ))}

                  {form.emergencyContacts.length < 2 && (
                    <button style={S.addContactBtn} type="button"
                      onClick={() => set("emergencyContacts", [...form.emergencyContacts, { ...EMPTY_CONTACT }])}>
                      <Plus size={14} /> Add second contact (optional)
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={S.ghostBtn} onClick={() => setStep(0)}>← Back</button>
                  <button style={S.nextBtn} onClick={() => setStep(2)}>Review →</button>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardIconWrap}><CheckCircle2 size={20} color="#F07028" /></div>
                  <div>
                    <h2 style={S.cardTitle}>Review & Confirm</h2>
                    <p style={S.cardSub}>Make sure everything looks correct</p>
                  </div>
                </div>

                <div style={S.reviewSection}>
                  <ReviewRow label="Name"           value={form.name || "—"} />
                  <ReviewRow label="Vehicle Number" value={form.vehicleNumber} highlight />
                  <ReviewRow label="Blood Group"    value={form.bloodGroup || "Not specified"} />
                </div>

                <div style={S.reviewSection}>
                  <p style={S.reviewSectionLabel}>Emergency Contacts</p>
                  {form.emergencyContacts.filter((c) => c.name || c.phone).map((c, i) => (
                    <div key={i} style={S.reviewContact}>
                      <div style={S.reviewContactAvatar}>{c.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p style={S.reviewContactName}>{c.name}</p>
                        <p style={S.reviewContactPhone}>{c.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={S.ghostBtn} onClick={() => setStep(1)}>← Back</button>
                  <button style={{ ...S.nextBtn, flex: 1 }} onClick={handleSubmit} disabled={saving}>
                    {saving ? "Saving…" : isEdit ? "Save Changes" : "Generate QR Code ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Preview panel ── */}
          <div style={S.previewSide}>
            <div style={S.previewCard}>
              <p style={S.previewLabel}>Live Preview</p>

              <div style={S.previewPlate}>
                <Car size={13} color="#F07028" />
                <span style={S.previewPlateNum}>{form.vehicleNumber || "MH12AB1234"}</span>
              </div>

              {form.name && <p style={S.previewName}>{form.name}</p>}

              {form.bloodGroup && (
                <div style={S.previewBlood}>
                  <Droplets size={12} color="#5CE8D8" />
                  <span style={{ color: "#5CE8D8", fontSize: 13, fontWeight: 700 }}>{form.bloodGroup}</span>
                </div>
              )}

              <div style={S.previewQrBox}>
                <div style={S.previewQrPlaceholder}>
                  <p style={S.previewQrText}>QR code will appear here after saving</p>
                </div>
              </div>

              {form.emergencyContacts.filter((c) => c.name).length > 0 && (
                <div style={S.previewContacts}>
                  <p style={S.previewContactsLabel}>Emergency Contacts</p>
                  {form.emergencyContacts.filter((c) => c.name).map((c, i) => (
                    <div key={i} style={S.previewContactRow}>
                      <div style={S.previewContactDot} />
                      <span style={S.previewContactName}>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={S.previewNote}>
              🔒 Phone numbers are <strong>never</strong> exposed in the QR code or public scan page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.fieldLabel}>
        <span style={{ color: "#F07028" }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div style={S.reviewRow}>
      <span style={S.reviewLabel}>{label}</span>
      <span style={{ ...S.reviewValue, color: highlight ? "#F07028" : "rgba(255,255,255,0.85)", letterSpacing: highlight ? 2 : 0, fontWeight: highlight ? 800 : 500 }}>
        {value}
      </span>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#06040e", color: "#fff", fontFamily: "var(--font-geist-sans), sans-serif", position: "relative", overflow: "hidden" },
  glowA: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,112,40,0.10), transparent 70%)", top: -150, left: -150, pointerEvents: "none" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "36px 24px 80px", position: "relative", zIndex: 1 },
  backBtn: { display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 32, padding: 0 },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" },

  /* Steps */
  steps: { display: "flex", alignItems: "center", marginBottom: 24, gap: 0 },
  stepWrap: { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" },
  stepNum: { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" },
  stepLabel: { fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" },
  stepLine: { flex: 1, height: 2, borderRadius: 2, margin: "0 8px", transition: "background 0.3s" },

  /* Card */
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 24 },
  cardHeader: { display: "flex", alignItems: "center", gap: 14 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 12, background: "rgba(240,112,40,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 },
  cardSub: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 },

  /* Fields */
  fields: { display: "flex", flexDirection: "column", gap: 14 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 7 },
  fieldLabel: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)" },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", borderRadius: 12, color: "#fff", fontSize: 14, padding: "12px 14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", appearance: "none" },

  /* Contact block */
  contactBlock: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" },
  contactBlockHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  contactBadge: { fontSize: 11, fontWeight: 700, color: "#F07028", background: "rgba(240,112,40,0.12)", borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: 0.5 },
  removeBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer" },
  addContactBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "transparent", border: "1.5px dashed rgba(240,112,40,0.3)", borderRadius: 12, color: "#F07028", fontSize: 13, fontWeight: 500, padding: "12px", cursor: "pointer" },

  /* Review */
  reviewSection: { display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16 },
  reviewSectionLabel: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  reviewRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  reviewLabel: { fontSize: 12, color: "rgba(255,255,255,0.38)" },
  reviewValue: { fontSize: 13 },
  reviewContact: { display: "flex", alignItems: "center", gap: 10 },
  reviewContactAvatar: { width: 28, height: 28, borderRadius: "50%", background: "rgba(240,112,40,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#F07028" },
  reviewContactName: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  reviewContactPhone: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 },

  /* Buttons */
  nextBtn: { flex: 1, background: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 24px", cursor: "pointer", boxShadow: "0 4px 20px rgba(240,112,40,0.3)" },
  ghostBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 14, padding: "13px 20px", cursor: "pointer" },

  /* Preview */
  previewSide: { display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 100 },
  previewCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 14 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
  previewPlate: { display: "flex", alignItems: "center", gap: 8, background: "rgba(240,112,40,0.08)", border: "1px solid rgba(240,112,40,0.18)", borderRadius: 10, padding: "10px 14px" },
  previewPlateNum: { fontSize: 18, fontWeight: 800, letterSpacing: 3, color: "#F07028" },
  previewName: { fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" },
  previewBlood: { display: "flex", alignItems: "center", gap: 6 },
  previewQrBox: { display: "flex", justifyContent: "center" },
  previewQrPlaceholder: { width: 140, height: 140, border: "2px dashed rgba(255,255,255,0.10)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 },
  previewQrText: { fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.5 },
  previewContacts: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  previewContactsLabel: { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
  previewContactRow: { display: "flex", alignItems: "center", gap: 8 },
  previewContactDot: { width: 6, height: 6, borderRadius: "50%", background: "#F07028", flexShrink: 0 },
  previewContactName: { fontSize: 13, color: "rgba(255,255,255,0.65)" },
  previewNote: { fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, textAlign: "center", padding: "0 8px" },

  /* Spinner */
  spinner: { width: 36, height: 36, border: "3px solid rgba(240,112,40,0.15)", borderTop: "3px solid #F07028", borderRadius: "50%", animation: "spin 0.8s linear infinite", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
};
