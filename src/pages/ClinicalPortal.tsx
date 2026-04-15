import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ScanLine,
  MessageSquare,
  Bot,
  X,
} from "lucide-react";
import { PatientSharedContent, MOCK_PATIENT } from "@/components/PatientSharedContent";
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
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (state !== "handshake") return;
    const t1 = setTimeout(() => setHandshakeStep(1), 800);
    const t2 = setTimeout(() => setHandshakeStep(2), 1600);
    const t3 = setTimeout(() => setState("hud"), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [state]);

  useEffect(() => {
    if (!chatOpen) { setChatLoading(true); return; }
    const t = setTimeout(() => setChatLoading(false), 2000);
    return () => clearTimeout(t);
  }, [chatOpen]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 flex items-center px-4 sm:px-6 gap-4 shrink-0 bg-primary shadow-sm">
        <Link to="/" className="shrink-0">
          <Logo variant="white" size="md" />
        </Link>
        <span className="text-xs text-white/80 font-semibold uppercase tracking-wider pl-4 border-l border-white/30 leading-none">Clinical Portal</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/15 hover:text-white" asChild>
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
                  className="absolute left-4 right-4 h-0.5 bg-primary/50"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <ScanLine className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground text-center px-6">
                    Position patient QR code within the viewfinder
                  </p>
                  <Button onClick={() => setState("handshake")} size="sm">Simulate Scan</Button>
                </div>
              </div>
            </motion.div>
          )}

          {state === "handshake" && (
            <motion.div key="handshake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <ScanLine className="w-7 h-7 text-primary" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 1 ? "✓" : "○"} Scanning QR...
                  </p>
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 1 ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 2 ? "✓" : "○"} Verifying consent token...
                  </p>
                  <p className={`text-sm font-mono transition-colors ${handshakeStep >= 2 ? "text-primary font-semibold" : "text-muted-foreground/40"}`}>
                    {handshakeStep >= 2 ? "✓ Access Granted" : "○ Awaiting authorization"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state === "hud" && (
            <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Sidebar */}
              <div className="w-full md:w-[240px] lg:w-[260px] bg-card border-r border-border shrink-0 flex flex-col min-h-0 overflow-y-auto">
                <div className="p-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold text-foreground text-base truncate pr-2">{MOCK_PATIENT.name}</h2>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setState("scanner")}>End</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs mb-2">
                      <div><span className="text-muted-foreground text-[9px] block uppercase font-semibold tracking-wider">Age/Sex</span> {MOCK_PATIENT.age}y / {MOCK_PATIENT.gender}</div>
                      <div><span className="text-muted-foreground text-[9px] block uppercase font-semibold tracking-wider">Blood</span> {MOCK_PATIENT.bloodType}</div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="biometrics" className="border-border px-0">
                        <AccordionTrigger className="text-[10px] font-semibold uppercase tracking-wider hover:no-underline py-2">Biometrics</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-1.5 pt-0.5 pb-1">
                            {[
                              { label: "BP", value: "142/91" },
                              { label: "HR", value: "78" },
                              { label: "SpO2", value: "98%" },
                              { label: "Temp", value: "98.4°F" },
                            ].map((v) => (
                              <div key={v.label} className="bg-muted p-1.5 rounded flex flex-col">
                                <span className="text-[8px] text-muted-foreground font-semibold uppercase">{v.label}</span>
                                <span className="text-[11px] font-semibold">{v.value}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="risks" className="border-border px-0">
                        <AccordionTrigger className="text-[10px] font-semibold uppercase tracking-wider hover:no-underline py-2">Patient Tags</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-0.5 pb-1">
                            <div>
                              <p className="text-[8px] text-muted-foreground uppercase font-semibold mb-1">Allergies</p>
                              <div className="flex flex-wrap gap-1">
                                {MOCK_PATIENT.allergies.map(a => <span key={a} className="px-1 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive font-medium border border-destructive/20">{a}</span>)}
                              </div>
                            </div>
                            <div>
                              <p className="text-[8px] text-muted-foreground uppercase font-semibold mb-1">Chronic</p>
                              <div className="flex flex-wrap gap-1">
                                {MOCK_PATIENT.chronic.map(c => <span key={c} className="px-1 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-medium border border-primary/20">{c}</span>)}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Risk gauge */}
                  <Card className="p-3 text-center">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-success via-warning to-destructive opacity-40 rounded-t" />
                    <h3 className="font-semibold text-[9px] uppercase tracking-wider text-muted-foreground mb-3">Composite Risk</h3>
                    <div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-2">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/15" />
                        <motion.circle
                          cx="40" cy="40" r="34"
                          fill="none"
                          stroke="hsl(var(--warning))"
                          strokeWidth="8"
                          strokeDasharray="213.6"
                          initial={{ strokeDashoffset: 213.6 }}
                          animate={{ strokeDashoffset: 213.6 * (1 - 0.66) }}
                          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="flex flex-col items-center z-10">
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-xl font-bold text-foreground leading-none">66</motion.span>
                        <span className="text-[9px] font-semibold text-warning uppercase">Moderate</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">Elevated CV metrics detected</p>
                  </Card>

                  <Button className="w-full h-9 text-[9px] font-semibold uppercase tracking-wider" onClick={() => setChatOpen(true)}>
                    <MessageSquare className="w-3.5 h-3.5 mr-2" /> Open AI Chat
                  </Button>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                <div className="flex-1 overflow-y-auto w-full pt-4 px-2 md:px-4">
                  <PatientSharedContent />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chat panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-card border-l border-border z-50 flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xs">Clinical AI Assistant</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
                <div className="bg-muted p-2.5 rounded-lg rounded-tl-none w-[85%] text-xs">
                  Hello Doctor. I am ready to assist with {MOCK_PATIENT.name}'s records. How can I help?
                </div>
                <div className="bg-primary text-primary-foreground p-2.5 rounded-lg rounded-tr-none w-[85%] text-xs self-end">
                  Summarize the patient's recent vitals trend and medication logic.
                </div>
                {chatLoading ? (
                  <div className="bg-muted p-2.5 flex items-center gap-2 w-20 rounded-lg rounded-tl-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-300" />
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-muted p-2.5 rounded-lg rounded-tl-none w-[90%] text-xs text-foreground/90 space-y-1.5 leading-relaxed">
                    <p>Analysis for Jordan Mitchell:</p>
                    <ul className="list-disc pl-3 space-y-0.5 my-1">
                      <li><strong>Vitals:</strong> BP increased 130/82 → 142/91 over 3 months. HR and SpO2 stable.</li>
                      <li><strong>Medication:</strong> Lisinopril dosage increased per protocol. No conflicts detected.</li>
                    </ul>
                    <p className="text-[10px] text-muted-foreground italic border-t border-border pt-1.5">AI-generated summary using retrieval from verified records (RAG).</p>
                  </motion.div>
                )}
              </div>

              <div className="p-3 border-t border-border bg-background flex gap-2 shrink-0">
                <input type="text" placeholder="Type a message..." className="flex-1 h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" disabled />
                <Button size="sm" className="h-8 text-xs" disabled>Send</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
