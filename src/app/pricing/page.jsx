"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { profileAPI } from "@/services/api";
import {
  Check, Sparkles, Package, Truck, QrCode,
  ShieldCheck, Star, ChevronRight, ArrowLeft, Zap,
} from "lucide-react";

const PLANS = [
  {
    id:       "single",
    name:     "Single",
    price:    99,
    stickers: 1,
    badge:    null,
    color:    "#F07028",
    gradient: "linear-gradient(135deg,#FFB347,#F07028,#E8411A)",
    features: [
      "1 premium QR sticker",
      "Weatherproof & tamper-proof",
      "Lifetime QR validity",
      "Email + contact alerts",
      "Standard shipping (5–7 days)",
    ],
  },
  {
    id:       "duo",
    name:     "Duo",
    price:    179,
    stickers: 2,
    badge:    "Most Popular",
    color:    "#5CE8D8",
    gradient: "linear-gradient(135deg,#5CE8D8,#00BCD4)",
    features: [
      "2 premium QR stickers",
      "Weatherproof & tamper-proof",
      "Lifetime QR validity",
      "Email + contact alerts",
      "Priority shipping (3–5 days)",
      "One replacement sticker free",
    ],
  },
];

const HOW_IT_WORKS = [
  { icon: QrCode,    title: "Profile set up",       desc: "Your vehicle is registered with a unique QR ID."         },
  { icon: Package,   title: "Sticker printed",      desc: "We print and pack your weatherproof QR sticker."         },
  { icon: Truck,     title: "Shipped to your door", desc: "Delivered to your address within the promised window."    },
  { icon: ShieldCheck, title: "Stick & protect",    desc: "Peel, stick on your vehicle, and you're fully protected." },
];

export default function PricingPage() {
  const router   = useRouter();
  const { loading: authLoading } = useAuth();
  const [selected, setSelected] = useState("duo");
  const [ordered,  setOrdered]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  if (authLoading) return (
    <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-[2.5px] border-[rgba(240,112,40,0.12)] border-t-[#F07028] animate-spin" />
    </div>
  );

  const plan = PLANS.find(p => p.id === selected);

  const handleOrder = async () => {
    setLoading(true);
    try {
      await profileAPI.placeOrder();
      setOrdered(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (ordered) return <OrderSuccess router={router} plan={plan} />;

  return (
    <div className="min-h-screen bg-[#07050f] text-white font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
        .plan-card { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .plan-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05] max-w-5xl mx-auto">
        <button onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-white/25 hover:text-white/55 transition-colors text-sm cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-[15px] font-black"
          style={{ background:"linear-gradient(90deg,#FFB347,#F07028)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Community
        </span>
        <div className="w-16" />
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">

        {/* Hero */}
        <div className="text-center mb-14 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[11px] font-bold uppercase tracking-widest"
            style={{ background:"rgba(240,112,40,0.1)", border:"1px solid rgba(240,112,40,0.2)", color:"#F07028" }}>
            <Zap size={11} /> Get your sticker
          </div>
          <h1 className="text-[40px] sm:text-[52px] font-black leading-[1.05] tracking-tight">
            Protect your vehicle<br />
            <span style={{ background:"linear-gradient(90deg,#FFB347,#F07028,#E8411A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              with one sticker
            </span>
          </h1>
          <p className="text-white/35 text-[15px] mt-5 leading-relaxed max-w-md mx-auto">
            Your QR profile is ready. Order a weatherproof sticker and anyone can report incidents to you — instantly.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 fade-up-2">
          {PLANS.map(p => {
            const active = selected === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className="plan-card rounded-3xl p-6 text-left cursor-pointer w-full relative overflow-hidden"
                style={{
                  background: active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${active ? p.color : "rgba(255,255,255,0.07)"}`,
                  boxShadow: active ? `0 0 40px ${p.color}20` : "none",
                }}>

                {/* Badge */}
                {p.badge && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                    style={{ background: p.gradient, color:"#fff" }}>
                    <Star size={9} fill="#fff" /> {p.badge}
                  </div>
                )}

                {/* Selected indicator */}
                <div className="w-5 h-5 rounded-full border-2 mb-5 flex items-center justify-center transition-all"
                  style={{
                    borderColor: active ? p.color : "rgba(255,255,255,0.15)",
                    background:  active ? p.color : "transparent",
                  }}>
                  {active && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>

                <p className="text-[13px] font-bold text-white/40 uppercase tracking-widest mb-1">{p.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[42px] font-black text-white leading-none">₹{p.price}</span>
                  <span className="text-white/30 text-sm">/ {p.stickers === 1 ? "sticker" : `${p.stickers} stickers`}</span>
                </div>
                <p className="text-[11px] mb-5" style={{ color: p.color }}>
                  ₹{Math.round(p.price / p.stickers)} per sticker
                </p>

                <div className="flex flex-col gap-2.5">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background:`${p.color}18` }}>
                        <Check size={9} color={p.color} strokeWidth={3} />
                      </div>
                      <span className="text-[12px] text-white/50 leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="fade-up-3 flex flex-col items-center gap-4">
          <button onClick={handleOrder} disabled={loading}
            className="flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-2xl text-white font-black text-[16px] cursor-pointer disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: plan.gradient, boxShadow:`0 10px 36px ${plan.color}35` }}>
            {loading
              ? <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing…</>
              : <><Package size={18} /> Order {plan.name} — ₹{plan.price} <ChevronRight size={16} /></>}
          </button>
          <p className="text-[11px] text-white/20 text-center">
            Free cancellation within 24 hours · COD not available
          </p>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center mb-8">How it works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                  style={{ background:"rgba(240,112,40,0.08)", border:"1.5px solid rgba(240,112,40,0.14)" }}>
                  <s.icon size={20} color="#F07028" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#0f0a0a] border border-white/[0.08] flex items-center justify-center text-[9px] font-black text-white/30">
                    {i + 1}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white/70">{s.title}</p>
                  <p className="text-[11px] text-white/25 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
          {[
            "Weatherproof sticker",
            "Lifetime QR validity",
            "No subscription",
            "Ships across India",
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/25">
              <ShieldCheck size={12} color="rgba(92,232,216,0.5)" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderSuccess({ router, plan }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveStep(1), 800),
      setTimeout(() => setActiveStep(2), 2200),
      setTimeout(() => setActiveStep(3), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#07050f] text-white font-sans flex items-center justify-center px-5">
      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.9); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes stepDone {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
        .pop-in   { animation: popIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .step-done { animation: stepDone 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="w-full max-w-[420px] flex flex-col items-center text-center gap-6 pop-in">

        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background:"linear-gradient(135deg,rgba(240,112,40,0.15),rgba(240,112,40,0.05))", border:"2px solid rgba(240,112,40,0.25)" }}>
          <Package size={40} color="#F07028" />
        </div>

        <div>
          <h1 className="text-[32px] font-black text-white leading-tight">Order placed!</h1>
          <p className="text-white/35 text-[14px] mt-2 leading-relaxed">
            Your <span className="text-white/70 font-semibold">{plan.name} sticker{plan.stickers > 1 ? "s" : ""}</span> will be shipped soon.
            We'll notify you once it's on the way.
          </p>
        </div>

        {/* Timeline */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/[0.07]"
          style={{ background:"rgba(255,255,255,0.02)" }}>
          {[
            { icon: Check,       label: "Order confirmed"       },
            { icon: Package,     label: "Sticker being printed" },
            { icon: Truck,       label: "Shipped to your address" },
            { icon: ShieldCheck, label: "Delivered & protected" },
          ].map((s, i) => {
            const done   = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.05] last:border-none transition-all duration-500">
                <div className={done ? "step-done" : ""} style={{ display:"contents" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500"
                    style={{
                      background: done   ? "rgba(34,197,94,0.12)"
                                : active ? "rgba(240,112,40,0.12)"
                                :          "rgba(255,255,255,0.04)",
                      border:     done   ? "1px solid rgba(34,197,94,0.25)"
                                : active ? "1px solid rgba(240,112,40,0.25)"
                                :          "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <s.icon size={14} color={done ? "#22c55e" : active ? "#F07028" : "rgba(255,255,255,0.15)"} />
                  </div>
                </div>
                <p className="text-[13px] font-semibold transition-all duration-500"
                  style={{ color: done ? "rgba(34,197,94,0.8)" : active ? "#fff" : "rgba(255,255,255,0.2)" }}>
                  {s.label}
                </p>
                <div className="ml-auto transition-all duration-300">
                  {done   && <Check size={13} color="#22c55e" className="step-done" />}
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#F07028] animate-pulse" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticker mockup */}
        <div className="w-full rounded-2xl p-6 flex flex-col items-center gap-4"
          style={{ background:"rgba(255,255,255,0.02)", border:"1.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">What you're getting</p>

          {/* Sticker visual */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow */}
            <div className="absolute w-52 h-28 rounded-3xl blur-2xl opacity-20"
              style={{ background:"linear-gradient(135deg,#FFB347,#F07028)" }} />

            {/* Sticker card */}
            <div className="relative rounded-2xl px-8 py-5 flex flex-col items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              style={{ background:"linear-gradient(145deg,#1a1208,#120d05)", border:"1.5px solid rgba(240,112,40,0.35)", minWidth:"220px" }}>

              {/* Top label */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Community Protected</span>
              </div>

              {/* QR placeholder */}
              <div className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <QrCode size={32} color="rgba(240,112,40,0.7)" />
              </div>

              {/* Plate number */}
              <div className="px-4 py-1.5 rounded-lg"
                style={{ background:"rgba(240,112,40,0.1)", border:"1px solid rgba(240,112,40,0.25)" }}>
                <span className="text-[15px] font-black tracking-[4px] text-[#F07028]">MH12AB1234</span>
              </div>

              {/* Scan prompt */}
              <p className="text-[9px] text-white/25 text-center">Scan to report an incident</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            {[["Weatherproof","Outdoor safe"],["Tamper-proof","Can't be peeled silently"],["Lifetime","Never expires"]].map(([title, desc]) => (
              <div key={title} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold text-white/60">{title}</p>
                <p className="text-[9px] text-white/25">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => router.push("/")}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer transition-all hover:opacity-90 active:scale-[0.97] w-full justify-center"
          style={{ background:"linear-gradient(135deg,#FFB347,#F07028,#E8411A)", boxShadow:"0 8px 28px rgba(240,112,40,0.3)" }}>
          <Sparkles size={15} /> Go to Dashboard
        </button>

        <p className="text-[11px] text-white/18">
          Your QR is active and ready while your sticker is in transit.
        </p>
      </div>
    </div>
  );
}
