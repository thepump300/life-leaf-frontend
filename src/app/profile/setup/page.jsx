"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Car, Phone, Droplets, ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI } from "@/services/api";

const BLOOD_GROUPS  = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const EMPTY_CONTACT = { name: "", phone: "" };
const STEPS         = ["Vehicle Info", "Emergency Contacts", "Review"];

export default function ProfileSetupPage() {
  const { loading } = useAuth();
  const router      = useRouter();

  const [isEdit,   setIsEdit]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step,     setStep]     = useState(0);

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
    <div className="min-h-screen bg-[#06040e] flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-[3px] border-[rgba(240,112,40,0.15)] border-t-[#F07028] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06040e] text-white font-sans relative overflow-hidden">
      {/* Glow */}
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(240,112,40,0.10), transparent 70%)", top: -150, left: -150 }}
      />

      <div className="max-w-[1000px] mx-auto px-6 pt-9 pb-20 relative z-[1]">
        {/* Back */}
        <button
          className="flex items-center gap-1.5 bg-transparent border-none text-white/40 text-[13px] cursor-pointer mb-8 p-0"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
          {/* ── Left: Form ── */}
          <div>
            {/* Progress steps */}
            <div className="flex items-center mb-6">
              {STEPS.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 flex-1"
                  onClick={() => i < step + 1 && setStep(i)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: i < step ? "#22c55e" : i === step ? "#F07028" : "rgba(255,255,255,0.08)",
                      border: i === step ? "2px solid #F07028" : i < step ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.12)",
                      cursor: i < step ? "pointer" : "default",
                    }}
                  >
                    {i < step
                      ? <CheckCircle2 size={14} color="#fff" />
                      : <span className="text-[13px] font-bold text-white/50">{i + 1}</span>
                    }
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-white" : "text-white/35"}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 rounded mx-2 transition-colors duration-300"
                      style={{ background: i < step ? "#22c55e" : "rgba(255,255,255,0.08)" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Vehicle Info ── */}
            {step === 0 && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-7 flex flex-col gap-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(240,112,40,0.12)] flex items-center justify-center shrink-0">
                    <Car size={20} color="#F07028" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-extrabold text-white m-0">Vehicle Details</h2>
                    <p className="text-xs text-white/40 mt-0.5">Enter your vehicle registration information</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  <FormField label="Your Name" icon={<User size={15} />}>
                    <input
                      className="w-full bg-white/[0.05] border-[1.5px] border-white/[0.09] rounded-xl text-white text-sm py-3 px-3.5 outline-none box-border transition-colors duration-200 placeholder:text-white/30"
                      type="text" placeholder="Full name" value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Vehicle Number *" icon={<Car size={15} />}>
                    <input
                      className="w-full bg-white/[0.05] border-[1.5px] border-white/[0.09] rounded-xl text-white text-sm py-3 px-3.5 outline-none box-border transition-colors duration-200 uppercase tracking-[3px] font-bold placeholder:text-white/30"
                      type="text" placeholder="e.g. MH12AB1234" value={form.vehicleNumber}
                      onChange={(e) => set("vehicleNumber", e.target.value.toUpperCase())} required
                    />
                  </FormField>

                  <FormField label="Blood Group (optional)" icon={<Droplets size={15} />}>
                    <select
                      className="w-full bg-white/[0.05] border-[1.5px] border-white/[0.09] rounded-xl text-white text-sm py-3 px-3.5 outline-none box-border cursor-pointer appearance-none"
                      value={form.bloodGroup}
                      onChange={(e) => set("bloodGroup", e.target.value)}
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FormField>
                </div>

                <button
                  className="flex-1 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[13px] px-6 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
                  onClick={() => { if (!form.vehicleNumber.trim()) { toast.error("Vehicle number required"); return; } setStep(1); }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 1: Emergency Contacts ── */}
            {step === 1 && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-7 flex flex-col gap-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(240,112,40,0.12)] flex items-center justify-center shrink-0">
                    <Phone size={20} color="#F07028" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-extrabold text-white m-0">Emergency Contacts</h2>
                    <p className="text-xs text-white/40 mt-0.5">Who should be notified in case of an incident?</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {form.emergencyContacts.map((c, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[11px] font-bold text-[#F07028] bg-[rgba(240,112,40,0.12)] rounded-md px-[9px] py-[3px] uppercase tracking-wide">
                          Contact {idx + 1}{idx === 0 ? " *" : ""}
                        </div>
                        {idx > 0 && (
                          <button
                            className="flex items-center gap-1 bg-transparent border-none text-red-500 text-xs cursor-pointer"
                            type="button"
                            onClick={() => set("emergencyContacts", form.emergencyContacts.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                      <input
                        className="w-full bg-white/[0.05] border-[1.5px] border-white/[0.09] rounded-xl text-white text-sm py-3 px-3.5 outline-none box-border placeholder:text-white/30"
                        type="text" placeholder="Contact name"
                        value={c.name} onChange={(e) => setContact(idx, "name", e.target.value)} required={idx === 0}
                      />
                      <input
                        className="w-full bg-white/[0.05] border-[1.5px] border-white/[0.09] rounded-xl text-white text-sm py-3 px-3.5 outline-none box-border mt-2 placeholder:text-white/30"
                        type="tel" placeholder="+91 98765 43210"
                        value={c.phone} onChange={(e) => setContact(idx, "phone", e.target.value)} required={idx === 0}
                      />
                    </div>
                  ))}

                  {form.emergencyContacts.length < 2 && (
                    <button
                      className="flex items-center justify-center gap-1.5 bg-transparent border-[1.5px] border-dashed border-[rgba(240,112,40,0.3)] rounded-xl text-[#F07028] text-[13px] font-medium py-3 cursor-pointer"
                      type="button"
                      onClick={() => set("emergencyContacts", [...form.emergencyContacts, { ...EMPTY_CONTACT }])}
                    >
                      <Plus size={14} /> Add second contact (optional)
                    </button>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    className="bg-white/[0.05] border border-white/10 rounded-xl text-white/60 font-semibold text-sm py-[13px] px-5 cursor-pointer"
                    onClick={() => setStep(0)}
                  >
                    ← Back
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[13px] px-6 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)]"
                    onClick={() => setStep(2)}
                  >
                    Review →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-7 flex flex-col gap-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(240,112,40,0.12)] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} color="#F07028" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-extrabold text-white m-0">Review &amp; Confirm</h2>
                    <p className="text-xs text-white/40 mt-0.5">Make sure everything looks correct</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 bg-white/[0.03] rounded-[14px] p-4">
                  <ReviewRow label="Name"           value={form.name || "—"} />
                  <ReviewRow label="Vehicle Number" value={form.vehicleNumber} highlight />
                  <ReviewRow label="Blood Group"    value={form.bloodGroup || "Not specified"} />
                </div>

                <div className="flex flex-col gap-2.5 bg-white/[0.03] rounded-[14px] p-4">
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-wide mb-1">Emergency Contacts</p>
                  {form.emergencyContacts.filter((c) => c.name || c.phone).map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[rgba(240,112,40,0.15)] flex items-center justify-center text-xs font-bold text-[#F07028]">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/80 m-0">{c.name}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{c.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    className="bg-white/[0.05] border border-white/10 rounded-xl text-white/60 font-semibold text-sm py-[13px] px-5 cursor-pointer"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-br from-[#FFB347] via-[#F07028] to-[#E8411A] border-none rounded-xl text-white font-bold text-sm py-[13px] px-6 cursor-pointer shadow-[0_4px_20px_rgba(240,112,40,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : isEdit ? "Save Changes" : "Generate QR Code ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Preview panel ── */}
          <div className="flex flex-col gap-3 sticky top-[100px]">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col gap-3.5">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-wide">Live Preview</p>

              <div className="flex items-center gap-2 bg-[rgba(240,112,40,0.08)] border border-[rgba(240,112,40,0.18)] rounded-[10px] py-2.5 px-3.5">
                <Car size={13} color="#F07028" />
                <span className="text-[18px] font-extrabold tracking-[3px] text-[#F07028]">
                  {form.vehicleNumber || "MH12AB1234"}
                </span>
              </div>

              {form.name && <p className="text-sm font-semibold text-white/70">{form.name}</p>}

              {form.bloodGroup && (
                <div className="flex items-center gap-1.5">
                  <Droplets size={12} color="#5CE8D8" />
                  <span className="text-[#5CE8D8] text-[13px] font-bold">{form.bloodGroup}</span>
                </div>
              )}

              <div className="flex justify-center">
                <div className="w-[140px] h-[140px] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center p-3">
                  <p className="text-[11px] text-white/25 text-center leading-relaxed">
                    QR code will appear here after saving
                  </p>
                </div>
              </div>

              {form.emergencyContacts.filter((c) => c.name).length > 0 && (
                <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wide">Emergency Contacts</p>
                  {form.emergencyContacts.filter((c) => c.name).map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F07028] shrink-0" />
                      <span className="text-[13px] text-white/65">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-white/30 leading-relaxed text-center px-2">
              🔒 Phone numbers are <strong>never</strong> exposed in the QR code or public scan page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-white/55">
        <span className="text-[#F07028]">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-[13px] ${highlight ? "text-[#F07028] tracking-[2px] font-extrabold" : "text-white/85 font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
