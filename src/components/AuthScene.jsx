"use client";

import { useEffect, useRef } from "react";

export default function AuthScene({ variant = "login" }) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = container.clientWidth;
    let H = container.clientHeight;

    const resize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // ── Floating nodes ─────────────────────────────────────────────
    const NODES = 22;
    const nodes = Array.from({ length: NODES }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r:  1.4 + Math.random() * 1.8,
      a:  0.28 + Math.random() * 0.52,
    }));

    // ── Pulse rings emanating from logo ────────────────────────────
    const rings = [{ r: 55, a: 0.65 }];
    const spawnRing = () => rings.push({ r: 55, a: 0.65 });
    const ringTimer = setInterval(spawnRing, 2200);

    let t = 0;
    let raf;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.016;

      const cx = W / 2;
      const cy = H * 0.41;

      ctx.clearRect(0, 0, W, H);

      // ── Dot grid ───────────────────────────────────────────────
      ctx.fillStyle = "rgba(255, 183, 71, 0.052)";
      for (let gx = 16; gx < W; gx += 32)
        for (let gy = 16; gy < H; gy += 32) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.65, 0, Math.PI * 2);
          ctx.fill();
        }

      // ── Ambient glow behind logo ───────────────────────────────
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, 230);
      ag.addColorStop(0,   "rgba(240,112,40,0.20)");
      ag.addColorStop(0.4, "rgba(232,65,26,0.07)");
      ag.addColorStop(1,   "rgba(240,112,40,0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(cx, cy, 230, 0, Math.PI * 2);
      ctx.fill();

      // ── Pulse rings ────────────────────────────────────────────
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(240, 112, 40, ${ring.a * 0.38})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ring.r += 0.85;
        ring.a -= 0.004;
        if (ring.r > 210 || ring.a <= 0) rings.splice(i, 1);
      }

      // ── Node connections ───────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 125) {
            ctx.strokeStyle = `rgba(240,112,40,${(1 - dist / 125) * 0.16})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // ── Nodes ──────────────────────────────────────────────────
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // soft glow
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        ng.addColorStop(0, `rgba(240,112,40,${n.a * 0.18})`);
        ng.addColorStop(1, "rgba(240,112,40,0)");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // core dot
        ctx.fillStyle = `rgba(255,179,71,${n.a * 0.75})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Logo ───────────────────────────────────────────────────
      const logoR = 44 + Math.sin(t * 0.7) * 1.8;

      // halo
      const halo = ctx.createRadialGradient(cx, cy, logoR * 0.65, cx, cy, logoR * 1.9);
      halo.addColorStop(0, "rgba(240,112,40,0.28)");
      halo.addColorStop(1, "rgba(240,112,40,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, logoR * 1.9, 0, Math.PI * 2);
      ctx.fill();

      // gradient fill
      const lg = ctx.createLinearGradient(cx - logoR, cy - logoR, cx + logoR, cy + logoR);
      lg.addColorStop(0,   "#FFB347");
      lg.addColorStop(0.5, "#F07028");
      lg.addColorStop(1,   "#E8411A");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(cx, cy, logoR, 0, Math.PI * 2);
      ctx.fill();

      // cyan stripe (logo detail)
      ctx.fillStyle = "rgba(92,232,216,0.88)";
      ctx.fillRect(cx - logoR * 0.72, cy + 5, logoR * 1.44, 3.5);
    };

    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(ringTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const copy = variant === "register"
    ? { eyebrow: "Join the community", h: "Drive smarter.", accent: "Connect on the go." }
    : { eyebrow: "Smart Vehicle Identity", h: "Protect privacy.", accent: "Connect instantly." };

  return (
    <div ref={containerRef} style={{
      position: "relative", width: "100%", height: "100%",
      overflow: "hidden", background: "#06040e",
    }}>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />

      {/* Top vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(to bottom, rgba(6,4,14,0.95) 0%, transparent 100%)",
        zIndex: 10, pointerEvents: "none",
      }} />

      {/* Bottom vignette */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 300,
        background: "linear-gradient(to top, rgba(6,4,14,1) 0%, rgba(6,4,14,0.72) 50%, transparent 100%)",
        zIndex: 10, pointerEvents: "none",
      }} />

      {/* Brand badge ── top-left */}
      <div style={{
        position: "absolute", top: 28, left: 28, zIndex: 20,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(145deg, #FFB347, #F07028, #E8411A)",
          boxShadow: "0 0 14px rgba(240,112,40,0.65), 0 0 36px rgba(240,112,40,0.22)",
        }} />
        <span style={{
          color: "#fff", fontWeight: 700, fontSize: 14,
          letterSpacing: "0.03em", textShadow: "0 2px 14px rgba(0,0,0,0.9)",
        }}>
          Community
        </span>
      </div>

      {/* Bottom copy */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        zIndex: 20, padding: "0 36px 40px",
      }}>
        <p style={{
          color: "#F07028", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.24em", textTransform: "uppercase", margin: "0 0 11px",
        }}>
          {copy.eyebrow}
        </p>

        <h2 style={{
          color: "#fff", fontWeight: 900, lineHeight: 1.12,
          margin: "0 0 20px",
          fontSize: "clamp(1.55rem, 2.7vw, 2.25rem)",
        }}>
          {copy.h}<br />
          <span style={{ color: "#5CE8D8" }}>{copy.accent}</span>
        </h2>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 0 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", gap: 16 }}>
            {["QR Identity", "Privacy First", "Instant Connect"].map((label, i) => (
              <span key={label} style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: i === 0 ? "#FFB347" : "rgba(255,255,255,0.22)",
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
