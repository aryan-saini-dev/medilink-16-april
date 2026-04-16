import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Activity,
  Pill,
  Stethoscope,
  FlaskConical,
  Download,
  Brain,
  HeartPulse,
  Eye,
  Ear,
  Bone,
  AirVent,
  Smile,
  Hand,
  Footprints,
  CheckCircle2,
  MinusCircle,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const MOCK_TIMELINE = [
  {
    date: "Apr 12, 2026",
    type: "vitals",
    title: "Vitals Check",
    brief: "BP 142/91 · HR 78 · SpO2 98%",
    detail: "Blood Pressure: 142/91 mmHg (elevated)\nHeart Rate: 78 bpm (normal)\nSpO2: 98% (normal)\nTemperature: 98.4°F\nRespiratory Rate: 16/min\n\nNotes: Patient reports mild headaches in the morning. BP trend shows gradual increase over last 3 visits. Consider adjusting antihypertensive medication.",
    icon: Activity,
  },
  {
    date: "Apr 12, 2026",
    type: "lab",
    title: "CBC Panel",
    brief: "WBC 7.2 · RBC 4.8 · Hgb 14.1",
    detail: "Complete Blood Count:\n─────────────────────\nWBC:  7.2  × 10³/µL  [4.5-11.0]\nRBC:  4.8  × 10⁶/µL  [4.7-6.1]\nHgb:  14.1 g/dL       [13.5-17.5]\nHct:  42.3 %          [38.3-48.6]\nPlt:  245  × 10³/µL   [150-400]\nMCV:  88.1 fL         [80-100]\nMCH:  29.4 pg         [27-33]\n\nAll values within normal range.",
    icon: FlaskConical,
  },
  {
    date: "Apr 10, 2026",
    type: "prescription",
    title: "Prescription Updated",
    brief: "Lisinopril 10mg → 20mg daily",
    detail: "Medication Change:\n─────────────────────\nDrug: Lisinopril\nPrevious: 10mg once daily\nNew: 20mg once daily\nReason: Suboptimal BP control\nPrescriber: Dr. Sarah Chen\n\n⚠ ALLERGY FLAG: Penicillin\n  Status: Verified, no cross-reactivity with ACE inhibitors.",
    icon: Pill,
  },
  {
    date: "Apr 8, 2026",
    type: "visit",
    title: "Office Visit — Cardiology",
    brief: "Routine follow-up · Dr. Sarah Chen",
    detail: "Visit Summary:\n─────────────────────\nProvider: Dr. Sarah Chen, MD\nDepartment: Cardiology\nType: Follow-up\n\nChief Complaint: Elevated BP readings at home\nAssessment: Stage 1 hypertension, improving\nPlan: Increase Lisinopril, recheck in 2 weeks\nOrder: Chest X-ray, Lipid panel",
    icon: Stethoscope,
  },
];

export const MOCK_PATIENT = {
  name: "Jordan Mitchell",
  age: 34,
  gender: "Male",
  bloodType: "O+",
  allergies: ["Penicillin", "Dust Mites"],
  chronic: ["Hypertension"],
  risk: "yellow" as const,
  summary: [
    "Blood pressure elevated (142/91 mmHg) — monitor closely",
    "Known allergy: Penicillin — flagged in all prescriptions",
    "Last visit: 2 days ago — follow-up for chest imaging",
  ],
};

type BodyPartStatus = "ok" | "alert" | "treated" | "na";
type BodyPartItem = {
  id: string;
  name: string;
  system: string;
  icon: React.ComponentType<{ className?: string }>;
  status: BodyPartStatus;
  metric: string;
  lastChecked: string;
  detail: string;
};

const BODY_PARTS: BodyPartItem[] = [
  { id: "brain", name: "Brain", system: "Neurological", icon: Brain, status: "ok", metric: "Cognitive screen: WNL", lastChecked: "Apr 12, 2026", detail: "Neuro screen normal. No red flags detected." },
  { id: "heart", name: "Heart", system: "Cardiovascular", icon: HeartPulse, status: "alert", metric: "BP 142/91 mmHg · HR 78", lastChecked: "Apr 12, 2026", detail: "Elevated BP trend (142/91). Monitor + adjust meds." },
  { id: "lungs", name: "Lungs", system: "Respiratory", icon: AirVent, status: "ok", metric: "SpO₂ 98% · RR 16/min", lastChecked: "Apr 12, 2026", detail: "No respiratory concerns reported. SpO2 stable (98%)." },
  { id: "eyes", name: "Eyes", system: "Ophthalmic", icon: Eye, status: "treated", metric: "Visual acuity 20/25", lastChecked: "Mar 04, 2026", detail: "Mild strain noted previously. Managed with rest + hydration." },
  { id: "ears", name: "Ears", system: "ENT", icon: Ear, status: "na", metric: "No data on file", lastChecked: "—", detail: "No recent data available." },
  { id: "teeth", name: "Teeth", system: "Dental", icon: Smile, status: "na", metric: "Records not linked", lastChecked: "—", detail: "Dental records not connected yet." },
  { id: "bones", name: "Bones", system: "Musculoskeletal", icon: Bone, status: "ok", metric: "BMD T-score: −0.3", lastChecked: "Jan 18, 2026", detail: "No musculoskeletal alerts flagged." },
  { id: "hands", name: "Hands", system: "Peripheral", icon: Hand, status: "ok", metric: "Grip strength normal", lastChecked: "Apr 08, 2026", detail: "No issues reported." },
  { id: "feet", name: "Feet", system: "Peripheral", icon: Footprints, status: "ok", metric: "Sensation intact", lastChecked: "Apr 08, 2026", detail: "Mobility normal. No neuropathy indicators." },
];

const STATUS_META: Record<BodyPartStatus, { label: string; dot: string; pillBg: string; pillText: string; ring: string }> = {
  ok:      { label: "Normal",   dot: "bg-emerald-500", pillBg: "bg-emerald-50",  pillText: "text-emerald-700", ring: "ring-emerald-200" },
  treated: { label: "Watch",    dot: "bg-amber-500",   pillBg: "bg-amber-50",    pillText: "text-amber-700",   ring: "ring-amber-200" },
  alert:   { label: "Alert",    dot: "bg-red-500",     pillBg: "bg-red-50",      pillText: "text-red-700",     ring: "ring-red-200" },
  na:      { label: "No data",  dot: "bg-slate-300",   pillBg: "bg-slate-50",    pillText: "text-slate-600",   ring: "ring-slate-200" },
};

function BodyPartStatusIcon({ status }: { status: BodyPartStatus }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-success" aria-label="Normal" />;
  if (status === "treated") return <CheckCircle2 className="w-4 h-4 text-warning" aria-label="Treated / watch" />;
  if (status === "na") return <MinusCircle className="w-4 h-4 text-muted-foreground" aria-label="Not available" />;
  return <AlertTriangle className="w-4 h-4 text-destructive" aria-label="Alert" />;
}

export function PatientSharedContent() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  return (
    <TooltipProvider>
      <Tabs defaultValue="diagnostics" className="w-full">
        <div className="px-6 border-b-2 border-border mb-6">
          <TabsList className="bg-transparent border-none p-0 h-auto gap-6 justify-start w-full overflow-x-auto pb-4 shadow-none">
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-16px] shadow-none">
              AI Diagnostics
            </TabsTrigger>
            <TabsTrigger value="anatomy" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-16px] shadow-none">
              Body parts
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-16px] shadow-none">
              History & Records
            </TabsTrigger>
            <TabsTrigger value="ml" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-16px] shadow-none">
              ML Models
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-6 pb-20">
          <TabsContent value="diagnostics" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-bold text-foreground text-lg">AI Overview & Risk Flags</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-xl p-5 shadow-pop-soft">
                  <h3 className="text-amber-700 font-bold mb-2">Elevated Blood Pressure</h3>
                  <p className="text-sm font-medium text-foreground/90 leading-relaxed mb-3">
                    Patient exhibits consistent trend of elevated blood pressure over the last 3 readings. Average 140/89. Recommended action: Medication adjustment.
                  </p>
                  <div className="h-1.5 w-full bg-amber-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[75%]" />
                  </div>
                </div>

                <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-5 shadow-pop-soft">
                  <h3 className="text-destructive font-bold mb-2">Allergy Interaction Risk</h3>
                  <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                    Penicillin allergy active. Current prescriptions have been validated against standard cross-reactivity databases. Zero conflicts detected.
                  </p>
                </div>
              </div>

              <div className="bg-card border-2 border-foreground rounded-xl p-5 shadow-sticker">
                <h3 className="font-display font-bold text-foreground mb-4">Summary</h3>
                <ul className="space-y-3">
                  {MOCK_PATIENT.summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="anatomy" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-card w-full rounded-2xl border-2 border-foreground overflow-hidden relative shadow-sticker">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="relative p-5 sm:p-6">
                  

  
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {BODY_PARTS.map((part) => {
                          const Icon = part.icon;
                          return (
                            <Tooltip key={part.id}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 border-foreground bg-background hover:bg-muted/40 shadow-pop-soft transition-bounce hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  <span className="w-8 h-8 rounded-full border-2 border-foreground bg-primary/10 flex items-center justify-center shadow-pop shrink-0">
                                    <Icon className="w-4.5 h-4.5 text-primary" />
                                  </span>
                                  <span className="flex-1 text-left text-sm font-semibold text-foreground truncate">
                                    {part.name}
                                  </span>
                                  <span className="shrink-0">
                                    <BodyPartStatusIcon status={part.status} />
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed border-2 border-foreground shadow-pop-soft">
                                <div className="font-semibold text-foreground mb-1">{part.name}</div>
                                <div className="text-muted-foreground">{part.detail}</div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Normal
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-warning" /> Treated / watch
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Alert
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MinusCircle className="w-3.5 h-3.5" /> N/A
                        </span>
                      </div>
                    </div>
                  
                </div>
              </div>
            </motion.div>
          </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="space-y-4">
              {MOCK_TIMELINE.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border-2 border-foreground bg-card transition-colors shadow-pop-soft">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-primary/10 border-2 border-foreground flex items-center justify-center shrink-0 shadow-pop">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {event.brief}
                      </p>
                    </div>
                    <div className="flex items-center ml-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hidden sm:flex border-2 border-foreground shadow-pop-soft hover:-translate-y-[1px] transition-bounce" onClick={() => setSelectedReport(i)}>View Report</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{event.title} - {event.date}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-xl p-4 overflow-auto max-h-[60vh]">
                              {event.detail}
                            </pre>
                            <Button className="w-full mt-4" variant="default">
                              <Download className="w-4 h-4 mr-2" /> Download PDF PDF
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="ml" className="mt-0 outline-none">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-sticker flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 rounded-full border-[12px] border-primary/20 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent -rotate-45"></div>
                  <span className="text-3xl font-display font-bold text-foreground">87%</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Hypertension Progression</h3>
                <p className="text-xs text-muted-foreground">Probability of Stage 2 hypertension within 12 months if untreated.</p>
              </div>

              <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-sticker flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-end justify-center mb-4 gap-2 pb-4">
                  <div className="w-6 bg-muted rounded-t-sm h-[40%]" />
                  <div className="w-6 bg-muted rounded-t-sm h-[50%]" />
                  <div className="w-6 bg-primary/40 rounded-t-sm h-[70%]" />
                  <div className="w-6 bg-primary rounded-t-sm h-[90%]" />
                  <div className="absolute bottom-4 left-0 right-0 h-px bg-border" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Medication Efficacy</h3>
                <p className="text-xs text-muted-foreground">Lisinopril response curve vs typical demographic baseline.</p>
              </div>
            </div>

            <div className="bg-foreground/[0.02] border-2 border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Model Parameters</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confidence Score</span>
                  <span className="font-mono text-success">HIGH (0.92)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dataset Baseline</span>
                  <span className="font-mono">North America / Adult / Male</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Run</span>
                  <span className="font-mono">15 mins ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </div>
      </Tabs>
    </TooltipProvider>
  );
}
