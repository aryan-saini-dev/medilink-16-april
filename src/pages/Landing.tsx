import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Puzzle,
  ArrowRight,
  Star,
  BarChart2,
  Shield,
  ScanLine,
  Bot,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

import medClinic from "@/assets/medical-clinic.jpg";
import medQr from "@/assets/medical-qr-access.jpg";
import medDiagnostics from "@/assets/medical-diagnostics.jpg";
import dashboardPreview from "@/assets/dashboard-preview.png";
import aiRagAgent from "@/assets/AI-RAG-Agent.webp";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMarcus from "@/assets/avatar-marcus.jpg";
import avatarPriya from "@/assets/avatar-priya.jpg";

const features = [
  {
    title: "Secure patient records",
    description: "End-to-end encrypted health records accessible only with patient consent via QR verification.",
    illustrationColor: "bg-[hsl(340,75%,95%)]",
  },
  {
    title: "Real-time diagnostics",
    description: "AI-assisted summaries with risk scoring powered by retrieval (RAG) and ML-based signals.",
    illustrationColor: "bg-[hsl(170,60%,92%)]",
  },
  {
    title: "Integrate with everything",
    description: "Connect EHR systems, lab platforms, imaging tools, and 20+ healthcare APIs in a few clicks.",
    illustrationColor: "bg-[hsl(45,90%,92%)]",
  },
  {
    title: "One hub for every patient",
    description: "Manage, monitor, and track every patient from a single clinical dashboard.",
    illustrationColor: "bg-[hsl(195,75%,94%)]",
  },
];

const AVATAR_URLS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=16",
];

const LOGO_URLS = [
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/slack-icon.svg", name: "Slack" },
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/zoom-icon.svg", name: "Zoom" },
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/hubspot.svg", name: "HubSpot" },
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/mailchimp-freddie.svg", name: "Mailchimp" },
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/google-calendar.svg", name: "Calendar" },
  { src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/stripe.svg", name: "Stripe" },
];

type BentoAccents = { integrationCircle: string; attendeeBorder: string; analyticsBars: string; analyticsAccent: string; pageButton: string };

function IllustrationPages({ accents }: { accents: BentoAccents }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-[85%] bg-white/90 rounded-xl border-2 border-foreground shadow-pop-soft overflow-hidden">
        <img src={medDiagnostics} alt="Medical dashboard preview" className="w-full h-28 object-cover" />
        <div className="p-3 space-y-2.5">
          <h4 className="text-[11px] font-bold text-foreground truncate">Patient Records Portal</h4>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span>📅 Apr 19, 2026</span>
            <span>📍 San Francisco</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-12">Name</span>
              <div className="h-5 bg-muted rounded-md flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-12">Email</span>
              <div className="h-5 bg-muted rounded-md flex-1" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-7 rounded-full border-2 border-foreground shadow-pop flex-1 flex items-center justify-center" style={{ backgroundColor: accents.pageButton }}>
              <span className="text-[9px] text-white font-semibold">Register now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IllustrationAnalytics({ accents }: { accents: BentoAccents }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-[85%] bg-white/90 rounded-xl border-2 border-foreground shadow-pop-soft p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4" style={{ color: accents.analyticsAccent }} />
          <span className="text-[10px] font-bold" style={{ color: accents.analyticsAccent }}>Live</span>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accents.analyticsBars }} />
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {[40, 65, 30, 55, 80, 45, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, backgroundColor: accents.analyticsBars }} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <span key={d} className="text-[7px] text-muted-foreground flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IllustrationIntegrations({ accents }: { accents: BentoAccents }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center z-10 border-2 border-foreground shadow-pop" style={{ backgroundColor: accents.integrationCircle }}>
        <Puzzle className="w-8 h-8 text-white" />
      </div>
      {LOGO_URLS.map((logo, i) => {
        const angle = (i * 60 - 90) * Math.PI / 180;
        const r = 85;
        return (
          <div key={i} className="absolute w-14 h-14 rounded-xl bg-white/90 border-2 border-foreground shadow-pop-soft flex items-center justify-center" style={{ left: `calc(50% + ${Math.cos(angle) * r}px - 28px)`, top: `calc(50% + ${Math.sin(angle) * r}px - 28px)` }}>
            <img src={logo.src} alt={logo.name} className="w-8 h-8" />
          </div>
        );
      })}
    </div>
  );
}

function IllustrationAttendees({ accents }: { accents: BentoAccents }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="grid grid-cols-3 gap-4">
        {AVATAR_URLS.map((url, i) => (
          <div key={i} className="w-16 h-16 rounded-full overflow-hidden shadow-pop border-[3px]" style={{ borderColor: accents.attendeeBorder }}>
            <img src={url} alt={`Attendee ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

const ILLUSTRATIONS = [IllustrationPages, IllustrationAnalytics, IllustrationIntegrations, IllustrationAttendees];
const rotatingWords = ["records.", "diagnostics.", "clarity.", "retrieval."];
const CONFETTI_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BCB", "#FF9F43"];
const CONFETTI_SHAPES = ["circle", "square", "triangle", "line"] as const;

const cornerSeeds = [
  [
    { x: -40, y: -20, shape: 0, color: 0, rot: 12, baseSize: 12 },
    { x: 220, y: -30, shape: 1, color: 1, rot: 45, baseSize: 8 },
    { x: -25, y: 200, shape: 2, color: 2, rot: -20, baseSize: 14 },
    { x: 240, y: 50, shape: 0, color: 3, rot: 0, baseSize: 5 },
    { x: -30, y: 100, shape: 3, color: 4, rot: 30, baseSize: 10 },
    { x: 200, y: 200, shape: 1, color: 1, rot: 15, baseSize: 6 },
    { x: 100, y: -35, shape: 0, color: 5, rot: 0, baseSize: 7 },
    { x: -45, y: 150, shape: 2, color: 0, rot: 55, baseSize: 9 },
  ],
  [
    { x: 230, y: -20, shape: 1, color: 1, rot: 22, baseSize: 7 },
    { x: -35, y: 40, shape: 2, color: 3, rot: 15, baseSize: 12 },
    { x: 40, y: -30, shape: 0, color: 0, rot: 0, baseSize: 10 },
    { x: 220, y: 190, shape: 3, color: 2, rot: -40, baseSize: 10 },
    { x: -20, y: 200, shape: 1, color: 4, rot: 60, baseSize: 6 },
    { x: 150, y: -40, shape: 0, color: 5, rot: 0, baseSize: 8 },
    { x: -50, y: 120, shape: 2, color: 1, rot: 35, baseSize: 11 },
    { x: 250, y: 80, shape: 3, color: 0, rot: -15, baseSize: 9 },
  ],
  [
    { x: 230, y: -25, shape: 0, color: 4, rot: 0, baseSize: 10 },
    { x: -35, y: 70, shape: 1, color: 1, rot: 35, baseSize: 7 },
    { x: 40, y: -30, shape: 2, color: 2, rot: 40, baseSize: 13 },
    { x: 240, y: 180, shape: 0, color: 3, rot: 0, baseSize: 5 },
    { x: -25, y: 190, shape: 3, color: 0, rot: -25, baseSize: 10 },
    { x: 100, y: -40, shape: 1, color: 5, rot: 20, baseSize: 8 },
    { x: -50, y: 140, shape: 0, color: 4, rot: 0, baseSize: 6 },
    { x: 250, y: 60, shape: 2, color: 2, rot: -50, baseSize: 11 },
  ],
  [
    { x: -40, y: 30, shape: 1, color: 3, rot: 18, baseSize: 8 },
    { x: 230, y: -25, shape: 2, color: 1, rot: -30, baseSize: 14 },
    { x: 50, y: 200, shape: 0, color: 4, rot: 0, baseSize: 8 },
    { x: 240, y: 100, shape: 3, color: 2, rot: 50, baseSize: 10 },
    { x: 20, y: -30, shape: 0, color: 0, rot: 0, baseSize: 6 },
    { x: -30, y: 160, shape: 1, color: 5, rot: -40, baseSize: 7 },
    { x: 180, y: -45, shape: 2, color: 3, rot: 25, baseSize: 10 },
    { x: -45, y: 90, shape: 0, color: 1, rot: 0, baseSize: 9 },
  ],
];

function ConfettiLayer({ size, opacity, count, spread }: { size: number; opacity: number; count: number; spread: number }) {
  const corners = [
    { side: "left" as const, vSide: "top" as const, originX: 105, originY: 95 },
    { side: "left" as const, vSide: "bottom" as const, originX: 95, originY: -95 },
    { side: "right" as const, vSide: "top" as const, originX: -105, originY: 95 },
    { side: "right" as const, vSide: "bottom" as const, originX: -105, originY: -95 },
  ];

  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      {corners.map((corner, ci) =>
        cornerSeeds[ci].slice(0, count).map((seed, si) => {
          const s = seed.baseSize * size;
          const finalX = seed.x * spread;
          const finalY = seed.y * spread;
          const color = CONFETTI_COLORS[seed.color % CONFETTI_COLORS.length];
          const shape = CONFETTI_SHAPES[seed.shape % CONFETTI_SHAPES.length];
          const sharedMotion = {
            initial: { [corner.side]: corner.originX, [corner.vSide]: Math.abs(corner.originY), opacity: 0, scale: 0, rotate: 0 },
            animate: { [corner.side]: finalX, [corner.vSide]: finalY < 0 ? Math.abs(finalY) : finalY, opacity, scale: 1, rotate: seed.rot },
            transition: { delay: 0.8 + si * 0.06 + ci * 0.04, duration: 0.5, type: "spring" as const, stiffness: 200, damping: 15 },
          };
          const posStyle: React.CSSProperties = { position: "absolute" };

          if (shape === "circle") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...posStyle, width: s, height: s, borderRadius: "50%", backgroundColor: color }} />;
          if (shape === "square") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...posStyle, width: s, height: s, borderRadius: 2, backgroundColor: color }} />;
          if (shape === "line") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...posStyle, width: s, height: s * 0.25, borderRadius: 99, backgroundColor: color }} />;
          const half = s / 2;
          return (
            <motion.div
              key={`${ci}-${si}`}
              {...sharedMotion}
              style={{ ...posStyle, width: 0, height: 0, borderLeft: `${half}px solid transparent`, borderRight: `${half}px solid transparent`, borderBottom: `${s * 0.85}px solid ${color}`, backgroundColor: "transparent" }}
            />
          );
        })
      )}
    </div>
  );
}

const Landing = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [navVisible, setNavVisible] = useState(false);
  const currentPreset = {
    cardBg: "bg-muted/50",
    colors: ["bg-[hsl(340,75%,95%)]", "bg-[hsl(170,60%,92%)]", "bg-[hsl(45,90%,92%)]", "bg-[hsl(195,75%,94%)]"],
    accents: { integrationCircle: "hsl(45,80%,45%)", attendeeBorder: "hsl(195,60%,80%)", analyticsBars: "hsl(170,60%,50%)", analyticsAccent: "hsl(170,60%,40%)", pageButton: "hsl(340,75%,58%)" },
  };
  const titleWeight = 700;
  const confettiSize = 2.5;
  const confettiOpacity = 0.8;
  const confettiCount = 8;
  const confettiSpread = 1.0;

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((prev) => (prev + 1) % rotatingWords.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavVisible(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6,.font-display").forEach((el) => {
      el.style.fontWeight = String(titleWeight);
    });
  }, [titleWeight]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <motion.nav
        className="fixed top-0 w-full z-50 bg-[#1E5AA8] shadow-md border-b border-[#164a8a]"
        initial={{ y: -100 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[64px] px-6 lg:px-8">
          <Link to="/" className="translate-y-[3px]">
            <Logo variant="white" size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-semibold text-white hover:bg-white/15 hover:text-white border-0 shadow-none" asChild>
              <Link to="/patient-login">Patient Login</Link>
            </Button>
            <Button className="hidden sm:inline-flex text-sm font-semibold bg-white text-[#1E5AA8] hover:bg-white/90 border-0 shadow-none" asChild>
              <Link to="/clinical-portal">Clinical Portal</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-[0.08]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-20 lg:pt-16 lg:pb-28">
          <div className="relative min-h-[580px] flex items-center justify-center">
            <ConfettiLayer size={confettiSize} opacity={confettiOpacity} count={confettiCount} spread={confettiSpread} />

            {[
              { img: medClinic, alt: "Clinical review", label: "Clinical", pos: "left-[-100px] lg:left-[-40px] top-[20px] w-[200px] lg:w-[260px]", rot: "rotate-[6deg]", delay: 0.2, init: { x: -80, y: -60 } },
              { img: medQr, alt: "QR access", label: "Access", pos: "left-[-120px] lg:left-[-60px] bottom-[20px] w-[200px] lg:w-[260px]", rot: "rotate-[-5deg]", delay: 0.35, init: { x: -80, y: 60 } },
              { img: aiRagAgent, alt: "RAG agent insights", label: "RAG + ML", pos: "right-[-100px] lg:right-[-40px] top-[20px] w-[200px] lg:w-[260px]", rot: "rotate-[-6deg]", delay: 0.25, init: { x: 80, y: -60 } },
              { img: medDiagnostics, alt: "Diagnostics HUD", label: "Diagnostics", pos: "right-[-120px] lg:right-[-60px] bottom-[20px] w-[200px] lg:w-[260px]", rot: "rotate-[5deg]", delay: 0.4, init: { x: 80, y: 60 } },
            ].map((card) => (
              <motion.div
                key={card.label}
                className={`hidden md:block absolute ${card.pos}`}
                initial={{ opacity: 0, scale: 0.3, ...card.init }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: card.delay }}
              >
                <div
                  className={`rounded-2xl overflow-hidden border-2 border-foreground ${
                    card.label === "Clinical"
                      ? "shadow-sticker-elevated-black-mint"
                      : card.label === "Access"
                        ? "shadow-sticker-elevated-black-amber"
                        : card.label === "RAG + ML"
                          ? "shadow-sticker-elevated-black-pink"
                          : "shadow-sticker-elevated-black"
                  } ${card.rot}`}
                >
                  <img src={card.img} alt={card.alt} className="w-full h-[150px] object-cover" />
                  <div className="bg-card px-3 py-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{card.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div className="text-center max-w-2xl mx-auto relative z-10" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center justify-center mb-5">
                <Logo variant="with-text" size="3xl" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-[#1E5AA8]/10 border border-[#1E5AA8]/20">
                <Shield className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span className="text-xs font-semibold text-[#1E5AA8] tracking-wide">HIPAA-COMPLIANT · SOC 2 TYPE II · END-TO-END ENCRYPTED</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[44px] 2xl:text-[56px] font-display tracking-tight leading-[1.15] text-foreground mb-6" style={{ fontWeight: titleWeight }}>
                The clinical platform built for
                <br />
                trusted medical{" "}
                <span className="inline-block relative translate-y-[8px]" style={{ minWidth: "7ch" }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingWords[wordIndex]}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35 }}
                      className="text-foreground inline-block"
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="invisible block h-0 overflow-hidden" aria-hidden="true">sovereignty.</span>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Patient-controlled access with AI-assisted diagnostics. Retrieval-grounded summaries (RAG) and clinician-verified records — secure by default.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button size="lg" className="text-base font-semibold px-8 h-12 bg-[#1E5AA8] hover:bg-[#164a8a] text-white border-2 border-foreground shadow-sticker-elevated active:shadow-pop-active active:translate-x-[2px] active:translate-y-[2px]" asChild>
                  <Link to="/patient-login">Enter Patient Portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base font-semibold px-8 h-12 text-[#1E293B] border-2 border-foreground shadow-sticker-elevated active:shadow-pop-active active:translate-x-[2px] active:translate-y-[2px]" asChild>
                  <Link to="/clinical-portal">Clinical Access</Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trusted by 240+ clinics</span>
                <span className="hidden sm:inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#1E5AA8]" /> 1.2M patient records secured</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 pb-20 lg:pb-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#1E293B 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-display text-foreground tracking-[-0.02em]" style={{ fontWeight: titleWeight }}>
              How MediLink works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Patient scans QR", description: "A unique, encrypted QR code ties your identity to your records — no passwords needed.", emoji: "📱" },
              { step: "02", title: "Consent + retrieval", description: "Access is granted via patient consent. The AI retrieves relevant notes and labs (RAG) before summarizing.", emoji: "🧠" },
              { step: "03", title: "Diagnostic HUD", description: "Clinicians see ML-prioritized summaries, vitals, and timelines — all in one distraction-free view.", emoji: "🩺" },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <div className="group">
                  <div
                    className="relative rounded-2xl p-8 mb-5 flex items-center justify-center h-[200px] border-2 border-foreground transition-all duration-300 ease-bounce group-hover:-translate-y-1 shadow-sticker-elevated-black"
                    style={{ backgroundColor: i === 0 ? "rgba(52, 211, 153, 0.08)" : i === 1 ? "rgba(244, 114, 182, 0.08)" : "rgba(251, 191, 36, 0.12)" }}
                  >
                    <span className="text-7xl drop-shadow-sm">{item.emoji}</span>
                    <span className="absolute top-4 left-4 text-[10px] font-mono px-2 py-0.5 rounded-full border-2 border-foreground bg-card shadow-pop-soft">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-2">{item.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed font-medium">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28 bg-card relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-[0.04]" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-display mb-4 text-foreground tracking-[-0.02em]" style={{ fontWeight: titleWeight }}>
              Everything you need for modern healthcare
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From patient onboarding to clinical diagnostics, MediLink has you covered.
            </p>
          </motion.div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.slice(0, 2).map((feature, i) => {
                const Illust = ILLUSTRATIONS[i];
                return (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <div className={`h-full rounded-3xl overflow-hidden ${currentPreset.cardBg} border-2 border-foreground shadow-sticker-elevated-black flex flex-col transition-all duration-300 ease-bounce hover:-translate-y-1 hover:-rotate-1`}>
                      <div className={`${currentPreset.colors[i]} aspect-[4/3] flex items-center justify-center`}>
                        <Illust accents={currentPreset.accents} />
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl mb-2 text-foreground tracking-[-0.01em]">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {features.slice(2).map((feature, rawI) => {
                const i = rawI + 2;
                const Illust = ILLUSTRATIONS[i];
                const isWide = rawI === 0;
                return (
                  <motion.div key={feature.title} className={isWide ? "md:col-span-3" : "md:col-span-2"} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <div className={`h-full rounded-3xl overflow-hidden ${currentPreset.cardBg} border-2 border-foreground shadow-sticker-elevated-black flex ${isWide ? "flex-col sm:flex-row" : "flex-col"} transition-all duration-300 ease-bounce hover:-translate-y-1 hover:-rotate-1`}>
                      <div className={`${currentPreset.colors[i]} ${isWide ? "sm:w-1/2 aspect-[4/3] sm:aspect-auto" : "aspect-[4/3]"} flex items-center justify-center relative flex-shrink-0`}>
                        <Illust accents={currentPreset.accents} />
                      </div>
                      <div className="p-6 flex flex-col justify-center">
                        <h3 className="font-display font-bold text-xl mb-2 text-foreground tracking-[-0.01em]">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-display mb-4 text-foreground tracking-[-0.02em]" style={{ fontWeight: titleWeight }}>
              Trusted by clinicians
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { quote: "MediLink cut our patient intake time by 80%. We went from fumbling with paper records to instant digital access.", name: "Dr. Sarah Chen", role: "Cardiologist", avatar: avatarSarah },
              { quote: "The grounded summaries are worth it. We finally have fast answers that cite the underlying records for compliance.", name: "Marcus Williams", role: "Hospital CTO", avatar: avatarMarcus },
              { quote: "Patients love the QR system. They feel in control of their data for the first time.", name: "Dr. Priya Patel", role: "Family medicine", avatar: avatarPriya },
              { quote: "We replaced three legacy systems with just MediLink. Everything in one place is a game changer for our staff.", name: "James Liu", role: "Clinic administrator", avatar: "https://i.pravatar.cc/300?img=33" },
              { quote: "The AI summaries are incredibly accurate. I can assess a new patient in under a minute.", name: "Dr. Amara Osei", role: "Emergency medicine", avatar: "https://i.pravatar.cc/300?img=47" },
            ].map((testimonial, i) => (
              <motion.div key={testimonial.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Card className="h-full overflow-hidden rounded-2xl border-2 border-foreground shadow-sticker-elevated transition-all duration-300 ease-bounce hover:-translate-y-1 hover:-rotate-1">
                  <div className="h-[180px] overflow-hidden">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed mb-5">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-10 lg:pt-16 pb-12 lg:pb-16 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative pt-20 lg:pt-24">
            <div className="absolute inset-x-0 top-0 z-20 flex justify-center pointer-events-none" aria-hidden="true">
              <motion.div initial={{ opacity: 0, y: 16, scale: 0.85 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 18 }} className="drop-shadow-[0_18px_40px_hsl(240_30%_14%_/_0.18)]">
                <svg width="130" height="158" viewBox="0 0 130 158" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="28" width="110" height="120" rx="16" fill="hsl(var(--card))" />
                  <rect x="10" y="28" width="110" height="32" rx="16" fill="hsl(var(--primary))" />
                  <rect x="10" y="44" width="110" height="16" fill="hsl(var(--primary))" />
                  <rect x="38" y="14" width="10" height="28" rx="5" fill="hsl(var(--foreground))" />
                  <rect x="82" y="14" width="10" height="28" rx="5" fill="hsl(var(--foreground))" />
                  {[0, 1, 2, 3, 4].map((col) =>
                    [0, 1, 2, 3].map((row) => (
                      <rect key={`${col}-${row}`} x={21 + col * 19} y={72 + row * 18} width="12" height="10" rx="2.5" fill={col === 3 && row === 2 ? "hsl(var(--primary))" : "hsl(var(--border))"} />
                    ))
                  )}
                  <path d="M75 100L78 103L84 96" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>

            <div className="rounded-[2rem] relative overflow-hidden px-6 pt-24 pb-10 lg:px-10 lg:pt-28 lg:pb-12 bg-card border-2 border-foreground shadow-sticker-elevated-black">
              <div className="absolute inset-0 pattern-dots opacity-[0.06]" />
              <div className="absolute -top-10 -right-12 w-40 h-40 rounded-full bg-primary/20 border-2 border-foreground shadow-pop-soft rotate-12" aria-hidden="true" />
              <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-[40%] bg-[hsl(170,60%,92%)] border-2 border-foreground shadow-pop-soft -rotate-6" aria-hidden="true" />

              <div className="text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <h2 className="text-3xl sm:text-4xl font-display mb-4 text-foreground tracking-[-0.02em]" style={{ fontWeight: titleWeight }}>
                    Ready to secure your health data?
                  </h2>
                  <p className="text-muted-foreground text-lg mb-7 max-w-xl mx-auto text-balance font-medium">
                    Join clinicians and patients who trust MediLink for ML-powered, retrieval-grounded summaries with patient-controlled access.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button size="lg" className="text-base font-semibold px-8 h-12" asChild>
                      <Link to="/patient-login">Enter the portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-base font-semibold px-8 h-12" asChild>
                      <Link to="/clinical-portal">Clinical view</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>

              <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { title: "RAG + citations", desc: "Summaries grounded in uploaded reports and labs.", icon: Bot, accent: "bg-primary/10 text-primary" },
                  { title: "Document extraction", desc: "Turn PDFs/scans into usable structured data.", icon: ScanLine, accent: "bg-[hsl(45,90%,92%)] text-foreground" },
                  { title: "FHIR-ready formats", desc: "Standardized records for interoperability.", icon: Puzzle, accent: "bg-[hsl(170,60%,92%)] text-foreground" },
                  { title: "Risk detection", desc: "Flags allergies, interactions, and duplications.", icon: Shield, accent: "bg-rose-500/10 text-rose-700" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border-2 border-foreground bg-background shadow-sticker-elevated-black p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full border-2 border-foreground shadow-pop flex items-center justify-center ${item.accent}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-foreground truncate">{item.title}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t-2 border-foreground bg-card">
        <div className="absolute inset-0 pattern-grid opacity-[0.05]" aria-hidden="true" />
        <div className="absolute -top-14 -left-16 w-56 h-56 rounded-full bg-primary/15 border-2 border-foreground shadow-pop-soft rotate-6" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-[40%] bg-[hsl(45,90%,92%)] border-2 border-foreground shadow-pop-soft -rotate-6" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-3">
                <Logo size="md" />
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-foreground bg-background shadow-pop-soft">
                  Patient-first
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md font-medium">
                A patient-controlled health passport with RAG-grounded summaries, structured timelines, and ML risk flags — designed for fast, safe clinical decisions.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" className="font-semibold" asChild>
                  <Link to="/patient-login">Patient portal <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button size="sm" variant="outline" className="font-semibold" asChild>
                  <Link to="/clinical-portal">Clinical portal</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Product</p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Features</a></li>
                  <li><a href="#features" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">RAG + citations</a></li>
                  <li><a href="#features" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">FHIR-ready formats</a></li>
                  <li><a href="#features" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Risk detection</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Portals</p>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/patient-login" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Patient login</Link></li>
                  <li><Link to="/clinical-portal" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Clinical portal</Link></li>
                  <li><Link to="/auth" className="font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Admin auth</Link></li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border-2 border-foreground bg-background shadow-sticker-elevated p-5">
                <p className="font-display font-bold text-foreground mb-1">Get product updates</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-3">
                  Mock signup — just for the frontend vibe.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="you@clinic.com" className="h-10" />
                  <Button className="h-10 px-4 font-semibold">Join</Button>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border-2 border-foreground bg-muted/40 shadow-pop flex items-center justify-center hover:-translate-y-[1px] transition-bounce"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-foreground" />
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border-2 border-foreground bg-muted/40 shadow-pop flex items-center justify-center hover:-translate-y-[1px] transition-bounce"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-foreground" />
                  </a>
                  <a
                    href="mailto:hello@medilink.health"
                    className="w-10 h-10 rounded-full border-2 border-foreground bg-muted/40 shadow-pop flex items-center justify-center hover:-translate-y-[1px] transition-bounce"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5 text-foreground" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t-2 border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground font-medium">© 2026 MediLink. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-full border border-border bg-background/60">RAG-grounded</span>
              <span className="px-2 py-1 rounded-full border border-border bg-background/60">FHIR-ready</span>
              <span className="px-2 py-1 rounded-full border border-border bg-background/60">Patient-controlled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
