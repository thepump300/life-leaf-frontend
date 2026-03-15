"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User, Car, Droplets, ArrowLeft,
  Plus, Trash2, Check, Shield, Sparkles,
  ChevronRight, QrCode,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI } from "@/services/api";

const BLOOD_GROUPS  = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const EMPTY_CONTACT = { name: "", phone: "" };
const STEPS = [
  { label: "Vehicle Info",        desc: "Register your vehicle to the QR sticker"      },
  { label: "Emergency Contacts",  desc: "Who gets notified when your QR is scanned"     },
  { label: "Ready to Go",         desc: "Review your profile before going live"          },
];

export default function ProfileSetupPage() {
  const { loading } = useAuth();
  const router      = useRouter();

  const [isEdit,   setIsEdit]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step,     setStep]     = useState(0);
  const [dir,      setDir]      = useState(1);
  const [animKey,  setAnimKey]  = useState(0);

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
            emergencyContacts: user.emergencyContacts?.length > 0
              ? user.emergencyContacts : [{ ...EMPTY_CONTACT }],
          });
        } else {
          setForm(f => ({ ...f, name: user.name || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [loading]);

  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setContact = (i, k, v) => {
    const c = [...form.emergencyContacts]; c[i] = { ...c[i], [k]: v };
    set("emergencyContacts", c);
  };

  const goTo = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setAnimKey(k => k + 1);
  };

  const handleNext = () => {
    if (step === 0 && !form.vehicleNumber.trim()) { toast.error("Vehicle number is required"); return; }
    goTo(step + 1);
  };

  const handleSubmit = async () => {
    if (!form.emergencyContacts[0]?.name || !form.emergencyContacts[0]?.phone) {
      toast.error("At least one emergency contact is required"); return;
    }
    setSaving(true);
    try {
      const payload = {
        name:              form.name.trim(),
        vehicleNumber:     form.vehicleNumber.trim().toUpperCase(),
        bloodGroup:        form.bloodGroup || undefined,
        emergencyContacts: form.emergencyContacts.filter(c => c.name.trim() && c.phone.trim()),
      };
      if (isEdit) { await profileAPI.update(payload); toast.success("Profile updated!"); }
      else        { await profileAPI.setup(payload);  toast.success("QR code generated!"); }
      router.push("/");
    } catch (err) { toast.error(err.message); }
    finally       { setSaving(false); }
  };

  if (loading || fetching) return (
    <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-[2.5px] border-[rgba(240,112,40,0.12)] border-t-[#F07028] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07050f] text-white flex flex-col lg:flex-row">
      <style>{`
        @keyframes slideForward {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideBack {
          from { opacity:0; transform:translateX(-40px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .slide-fwd  { animation: slideForward 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-back { animation: slideBack    0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .inp {
          width:100%; background:rgba(255,255,255,0.04);
          border:1.5px solid rgba(255,255,255,0.08); border-radius:14px;
          color:#fff; font-size:14px; padding:14px 16px;
          outline:none; transition:all .2s;
        }
        .inp:focus {
          border-color:rgba(240,112,40,0.5);
          background:rgba(255,255,255,0.06);
          box-shadow:0 0 0 4px rgba(240,112,40,0.08);
        }
        .inp::placeholder { color:rgba(255,255,255,0.18); }
        .blood-pill { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .blood-pill:active { transform: scale(0.94) !important; }
      `}</style>

      {/* ═══════════════════════════════════════ LEFT PANEL ═══ */}
      <div className="hidden lg:flex lg:w-[320px] shrink-0 flex-col relative overflow-hidden"
        style={{ background:"linear-gradient(180deg,#0c0818 0%,#0f0c05 100%)" }}>

        {/* Left accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background:"linear-gradient(180deg,#FFB347,#F07028,#E8411A,transparent 85%)" }} />

        {/* Glow orbs */}
        <div className="absolute top-16 left-8 w-56 h-56 opacity-25 pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(240,112,40,0.5),transparent 65%)" }} />
        <div className="absolute bottom-16 right-0 w-40 h-40 opacity-15 pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(92,232,216,0.5),transparent 65%)" }} />

        <div className="relative z-10 flex flex-col h-full px-9 py-10">

          {/* Brand + back */}
          <div className="mb-14">
            <button onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-xs mb-8 cursor-pointer group">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to dashboard
            </button>
            <p className="text-[13px] font-black"
              style={{ background:"linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Community
            </p>
          </div>

          {/* Giant step number */}
          <div className="mb-6 select-none">
            <div className="text-[96px] font-black leading-none tracking-tighter"
              style={{ color:"rgba(255,255,255,0.035)", lineHeight:1 }}>
              {String(step + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop:"-28px" }}>
              <h2 className="text-[20px] font-black text-white">{STEPS[step].label}</h2>
              <p className="text-[12px] text-white/25 mt-1.5 leading-relaxed">{STEPS[step].desc}</p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex flex-col gap-3 mb-auto">
            {STEPS.map((s, i) => {
              const done   = i < step;
              const active = i === step;
              return (
                <button key={i} onClick={() => done && goTo(i)}
                  className="flex items-center gap-3 transition-all duration-200 w-full text-left"
                  style={{ cursor: done ? "pointer" : "default" }}>
                  <div className="shrink-0 transition-all duration-300"
                    style={{
                      width:  active ? "10px" : "8px",
                      height: active ? "10px" : "8px",
                      borderRadius: "50%",
                      background: done ? "#22c55e" : active ? "#F07028" : "rgba(255,255,255,0.1)",
                      boxShadow: active ? "0 0 12px rgba(240,112,40,0.7)" : "none",
                    }} />
                  <span className="text-[13px] font-semibold transition-colors duration-200"
                    style={{ color: done ? "rgba(34,197,94,0.65)" : active ? "#fff" : "rgba(255,255,255,0.18)" }}>
                    {s.label}
                  </span>
                  {done && <Check size={10} color="#22c55e" className="ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Sticker preview — only shows when user has started filling */}
          {(form.vehicleNumber || form.name) && (
            <div className="mt-auto pt-7 border-t border-white/[0.05]">
              <p className="text-[9px] font-bold text-white/15 uppercase tracking-widest mb-3">Sticker Preview</p>
              <div className="rounded-2xl p-4 border border-white/[0.06]"
                style={{ background:"rgba(255,255,255,0.015)" }}>
                <div className="text-center">
                  <div className="inline-block px-5 py-2.5 rounded-xl mb-3"
                    style={{ background:"rgba(240,112,40,0.09)", border:"1px solid rgba(240,112,40,0.18)" }}>
                    <p className="text-[20px] font-black tracking-[5px] text-[#F07028]">
                      {form.vehicleNumber || "——"}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {form.name && <span className="text-[11px] text-white/35">{form.name}</span>}
                    {form.bloodGroup && (
                      <span className="text-[11px] font-black text-[#5CE8D8] bg-[rgba(92,232,216,0.08)] px-2.5 py-0.5 rounded-lg">
                        {form.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════ RIGHT PANEL ═══ */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Progress bar */}
        <div className="h-[3px] bg-white/[0.05] shrink-0">
          <div className="h-full transition-all duration-600 ease-out"
            style={{
              width: `${step === 0 ? 33 : step === 1 ? 66 : 100}%`,
              background: "linear-gradient(90deg,#FFB347,#F07028,#E8411A)",
            }} />
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.push("/")}
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer p-1">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold text-[#F07028] uppercase tracking-wider">Step {step + 1} of 3</p>
            <p className="text-[13px] font-bold text-white">{STEPS[step].label}</p>
          </div>
          <div className="w-8" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-0">
          <div className="w-full max-w-[480px]"
            key={animKey}
            className={dir >= 0 ? "slide-fwd" : "slide-back"}>

            {/* ── STEP 0 ── */}
            {step === 0 && (
              <div className="flex flex-col gap-7">
                <div>
                  <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tight">
                    Set up your vehicle
                  </h1>
                  <p className="text-white/30 text-[14px] mt-3 leading-relaxed">
                    This info links to your QR sticker so anyone can report incidents on your behalf.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <Field label="Full Name">
                    <input className="inp" type="text" placeholder="e.g. Darshan Gada"
                      value={form.name} onChange={e => set("name", e.target.value)} />
                  </Field>

                  <Field label={<>Vehicle Number <Required /></>}>
                    <div className="relative">
                      <input className="inp" type="text" placeholder="MH12AB1234"
                        value={form.vehicleNumber}
                        onChange={e => set("vehicleNumber", e.target.value.toUpperCase())}
                        style={{ letterSpacing:"4px", fontWeight:800, fontSize:"20px", color:"#F07028", paddingRight:"48px" }} />
                      <Car size={16} color="rgba(240,112,40,0.35)" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Blood Group" hint="optional · shown to scanner in emergencies">
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map(g => {
                        const on = form.bloodGroup === g;
                        return (
                          <button key={g} type="button"
                            onClick={() => set("bloodGroup", on ? "" : g)}
                            className="blood-pill py-3.5 rounded-2xl text-[15px] font-black"
                            style={{
                              background: on ? "linear-gradient(135deg,#FFB347,#F07028)" : "rgba(255,255,255,0.04)",
                              border:     `1.5px solid ${on ? "transparent" : "rgba(255,255,255,0.07)"}`,
                              color:      on ? "#fff" : "rgba(255,255,255,0.22)",
                              boxShadow:  on ? "0 6px 22px rgba(240,112,40,0.38)" : "none",
                              transform:  on ? "scale(1.06)" : "scale(1)",
                            }}>
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                <div className="flex justify-end">
                  <PrimaryBtn onClick={handleNext}>Continue <ChevronRight size={16} /></PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tight">
                    Emergency contacts
                  </h1>
                  <p className="text-white/30 text-[14px] mt-3 leading-relaxed">
                    They get an instant alert when someone scans your QR. Their numbers are never shown publicly.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {form.emergencyContacts.map((c, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1.5px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-black transition-all duration-200"
                            style={{
                              background: c.name ? "linear-gradient(135deg,#FFB347,#E8411A)" : "rgba(255,255,255,0.06)",
                              color:      c.name ? "#fff" : "rgba(255,255,255,0.18)",
                            }}>
                            {c.name ? c.name[0].toUpperCase() : String(idx + 1)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white/65">{c.name || `Contact ${idx + 1}`}</p>
                            <p className="text-[10px] text-white/22">{idx === 0 ? "Primary · Required" : "Secondary · Optional"}</p>
                          </div>
                        </div>
                        {idx > 0 && (
                          <button type="button"
                            onClick={() => set("emergencyContacts", form.emergencyContacts.filter((_, i) => i !== idx))}
                            className="flex items-center gap-1.5 text-[11px] text-red-400/25 hover:text-red-400 cursor-pointer transition-colors">
                            <Trash2 size={11} /> Remove
                          </button>
                        )}
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className="inp" type="text" placeholder="Name (Mom, Dad…)"
                          value={c.name} onChange={e => setContact(idx, "name", e.target.value)} />
                        <input className="inp" type="tel" placeholder="+91 98765 43210"
                          value={c.phone} onChange={e => setContact(idx, "phone", e.target.value)} />
                      </div>
                    </div>
                  ))}

                  {form.emergencyContacts.length < 2 && (
                    <button type="button"
                      onClick={() => set("emergencyContacts", [...form.emergencyContacts, { ...EMPTY_CONTACT }])}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/[0.07] hover:border-[rgba(240,112,40,0.25)] text-white/18 hover:text-[#F07028] text-[13px] font-semibold cursor-pointer transition-all duration-200">
                      <Plus size={14} /> Add second contact
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <SecondaryBtn onClick={() => goTo(0)}><ArrowLeft size={14} /> Back</SecondaryBtn>
                  <PrimaryBtn onClick={handleNext}>Review <ChevronRight size={16} /></PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  {/* Done badge */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background:"rgba(34,197,94,0.1)", border:"1.5px solid rgba(34,197,94,0.2)" }}>
                    <Check size={26} color="#22c55e" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tight">
                    {isEdit ? "Review changes" : "You're all set"}
                  </h1>
                  <p className="text-white/30 text-[14px] mt-3 leading-relaxed">
                    {isEdit
                      ? "Everything look right? Save to update your profile."
                      : "We'll generate a unique QR sticker for your vehicle after saving."}
                  </p>
                </div>

                {/* Vehicle summary */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ background:"linear-gradient(135deg,rgba(240,112,40,0.07),rgba(240,112,40,0.02))", border:"1.5px solid rgba(240,112,40,0.14)" }}>
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-2">Vehicle</p>
                      <p className="text-[28px] font-black tracking-[5px] text-[#F07028] leading-none truncate">{form.vehicleNumber}</p>
                      {form.name && <p className="text-[13px] text-white/45 font-semibold mt-2">{form.name}</p>}
                    </div>
                    {form.bloodGroup && (
                      <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl shrink-0"
                        style={{ background:"rgba(92,232,216,0.07)", border:"1px solid rgba(92,232,216,0.14)" }}>
                        <Droplets size={13} color="#5CE8D8" />
                        <span className="text-[20px] font-black text-[#5CE8D8] leading-none">{form.bloodGroup}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-6 py-2.5 border-t border-[rgba(240,112,40,0.09)]"
                    style={{ background:"rgba(240,112,40,0.025)" }}>
                    <QrCode size={11} color="rgba(240,112,40,0.45)" />
                    <p className="text-[11px] font-semibold" style={{ color:"rgba(240,112,40,0.45)" }}>
                      QR code generated after saving
                    </p>
                  </div>
                </div>

                {/* Contacts summary */}
                {form.emergencyContacts.filter(c => c.name).length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background:"rgba(255,255,255,0.02)", border:"1.5px solid rgba(255,255,255,0.06)" }}>
                    <div className="px-5 py-3 border-b border-white/[0.05]">
                      <p className="text-[9px] font-bold text-white/18 uppercase tracking-widest">Emergency Contacts</p>
                    </div>
                    {form.emergencyContacts.filter(c => c.name).map((c, i) => (
                      <div key={i} className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.04] last:border-none">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                          style={{ background:"linear-gradient(135deg,#FFB347,#E8411A)", color:"#fff" }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-white/75">{c.name}</p>
                          <p className="text-[11px] text-white/28">{c.phone}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background:"rgba(34,197,94,0.1)" }}>
                          <Check size={11} color="#22c55e" strokeWidth={2.5} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Privacy note */}
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.018)", border:"1.5px solid rgba(255,255,255,0.05)" }}>
                  <Shield size={13} color="rgba(255,255,255,0.18)" className="shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/28 leading-relaxed">
                    Only your vehicle number{form.bloodGroup ? " and blood group" : ""} are public.
                    Contact details stay private.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <SecondaryBtn onClick={() => goTo(1)}><ArrowLeft size={14} /> Back</SecondaryBtn>
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ background:"linear-gradient(135deg,#FFB347,#F07028,#E8411A)", boxShadow:"0 8px 30px rgba(240,112,40,0.38)" }}>
                    {saving
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                      : isEdit
                        ? <><Check size={15} /> Save Changes</>
                        : <><Sparkles size={15} /> Generate My QR</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/28 uppercase tracking-widest">
        {label}
        {hint && <span className="font-normal normal-case tracking-normal text-white/14">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Required() {
  return <span style={{ color:"#F07028" }}>*</span>;
}

function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.97]"
      style={{ background:"linear-gradient(135deg,#FFB347,#F07028,#E8411A)", boxShadow:"0 6px 24px rgba(240,112,40,0.3)" }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-white/30 hover:text-white/55 font-semibold text-sm cursor-pointer transition-all active:scale-[0.97]">
      {children}
    </button>
  );
}
