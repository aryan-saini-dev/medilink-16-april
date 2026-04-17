import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ScanLine,
  MessageSquare,
} from "lucide-react";
import { PatientSharedContent, MOCK_PATIENT } from "@/components/PatientSharedContent";
import { AIChatPanel } from "@/components/AIChatPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type PortalState = "scanner" | "handshake" | "hud";

export default function ClinicalPortal() {
  const [state, setState] = useState<PortalState>("scanner");
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (state !== "handshake") return;
    const t1 = setTimeout(() => setHandshakeStep(1), 800);
    const t2 = setTimeout(() => setHandshakeStep(2), 1600);
    const t3 = setTimeout(() => setState("hud"), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [state]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 flex items-center px-4 sm:px-6 gap-4 shrink-0 bg-[#1E5AA8] shadow-sm">
        <Link to="/" className="shrink-0 translate-y-[3px]">
          <Logo variant="white" size="md" />
        </Link>
        <span className="text-xs text-white/80 font-bold uppercase tracking-widest pl-4 border-l border-white/30 leading-none">Clinical Portal</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white" asChild>
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Link>
        </Button>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        <AnimatePresence mode="wait">
          {state === "scanner" && (
            <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center relative">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-lg" />
                <motion.div
                  className="absolute left-4 right-4 h-0.5 bg-primary/60"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <ScanLine className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground text-center px-6">
                    Position patient QR code within the viewfinder
                  </p>
                  <Button onClick={() => setState("handshake")} size="sm">
                    Simulate Scan
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {state === "handshake" && (
            <motion.div key="handshake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center mx-auto shadow-pop">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <ScanLine className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 1 ? "✓" : "○"} Scanning QR...
                  </p>
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 1 ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 2 ? "✓" : "○"} Verifying consent token...
                  </p>
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 2 ? "text-primary font-bold" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 2 ? "✓ Access Granted" : "○ Awaiting authorization"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state === "hud" && (
            <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              <div className="w-full md:w-[240px] lg:w-[260px] bg-card border-r-2 border-border shrink-0 flex flex-col min-h-0 overflow-y-auto">
                <div className="p-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-display font-bold text-foreground text-base truncate pr-2">{MOCK_PATIENT.name}</h2>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setState("scanner")}>End</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs mb-2">
                      <div><span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-widest">Age/Sex</span> {MOCK_PATIENT.age}y / {MOCK_PATIENT.gender}</div>
                      <div><span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-widest">Blood</span> {MOCK_PATIENT.bloodType}</div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="biometrics" className="border-border px-0">
                        <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-2">
                          Biometrics
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-1.5 pt-0.5 pb-1">
                            <div className="bg-muted p-1.5 rounded flex flex-col">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">BP</span>
                              <span className="text-[11px] font-bold">142/91</span>
                            </div>
                            <div className="bg-muted p-1.5 rounded flex flex-col">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">HR</span>
                              <span className="text-[11px] font-bold">78</span>
                            </div>
                            <div className="bg-muted p-1.5 rounded flex flex-col">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">SpO2</span>
                              <span className="text-[11px] font-bold">98%</span>
                            </div>
                            <div className="bg-muted p-1.5 rounded flex flex-col">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">Temp</span>
                              <span className="text-[11px] font-bold">98.4°F</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="risks" className="border-border px-0">
                        <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-2">
                          Patient Tags
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-0.5 pb-1">
                            <div>
                              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1 tracking-tighter">Allergies</p>
                              <div className="flex flex-wrap gap-1">
                                {MOCK_PATIENT.allergies.map(a => <span key={a} className="px-1 py-0.5 rounded text-[9px] bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">{a}</span>)}
                              </div>
                            </div>
                            <div>
                              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1 tracking-tighter">Chronic</p>
                              <div className="flex flex-wrap gap-1">
                                {MOCK_PATIENT.chronic.map(c => <span key={c} className="px-1 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-bold border border-primary/20">{c}</span>)}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-foreground/[0.02] border-2 border-border rounded-xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-50" />
                    <h3 className="font-display font-bold text-[9px] uppercase tracking-widest text-muted-foreground mb-3">Composite Risk</h3>
                    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/15" />
                        <motion.circle
                          cx="48" cy="48" r="40"
                          fill="none"
                          stroke="url(#sidebarRiskFixed)"
                          strokeWidth="10"
                          strokeDasharray="251.3"
                          initial={{ strokeDashoffset: 251.3 }}
                          animate={{ strokeDashoffset: 251.3 * (1 - 0.66) }}
                          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="sidebarRiskFixed" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FB923C" />
                            <stop offset="100%" stopColor="#F59E0B" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="flex flex-col items-center z-10">
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-2xl font-display font-bold text-foreground leading-none">
                          66
                        </motion.span>
                        <span className="text-[9px] font-bold text-amber-600 tracking-tighter uppercase">Modest</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-medium leading-tight">
                      Elevated CV metrics detected
                    </p>
                  </div>

              <Button className="w-full h-9 text-[9px] font-bold uppercase tracking-widest bg-foreground hover:bg-foreground/90 text-background" onClick={() => setChatOpen(true)}>
                    <MessageSquare className="w-3.5 h-3.5 mr-2" /> Open AI Chat
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                <div className="flex-1 overflow-y-auto w-full pt-4 px-2 md:px-4">
                  <PatientSharedContent />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AIChatPanel
          audience="clinician"
          patientName={MOCK_PATIENT.name}
          open={chatOpen}
          onOpenChange={setChatOpen}
          hideTrigger
        />
      </div>
    </div>
  );
}
