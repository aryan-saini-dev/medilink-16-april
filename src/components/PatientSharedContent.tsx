import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  icon: React.ComponentType<{ className?: string }>;
  status: BodyPartStatus;
  detail: string;
};

const BODY_PARTS: BodyPartItem[] = [
  { id: "brain", name: "Brain / Neuro", icon: Brain, status: "ok", detail: "Neuro screen normal. No red flags detected." },
  { id: "heart", name: "Cardiovascular", icon: HeartPulse, status: "alert", detail: "Elevated BP trend (142/91). Monitor + adjust meds." },
  { id: "lungs", name: "Pulmonary", icon: AirVent, status: "ok", detail: "No respiratory concerns reported. SpO2 stable (98%)." },
  { id: "eyes", name: "Ophthalmology", icon: Eye, status: "treated", detail: "Mild strain noted previously. Managed with rest + hydration." },
  { id: "ears", name: "ENT", icon: Ear, status: "na", detail: "No recent data available." },
  { id: "teeth", name: "Dental", icon: Smile, status: "na", detail: "Dental records not connected yet." },
  { id: "bones", name: "Musculoskeletal", icon: Bone, status: "ok", detail: "No musculoskeletal alerts flagged." },
  { id: "hands", name: "Upper Extremities", icon: Hand, status: "ok", detail: "No issues reported." },
  { id: "feet", name: "Lower Extremities", icon: Footprints, status: "ok", detail: "Mobility normal. No neuropathy indicators." },
];

const statusLabel: Record<BodyPartStatus, string> = { ok: "Normal", alert: "Alert", treated: "Monitoring", na: "N/A" };
const statusColor: Record<BodyPartStatus, string> = { ok: "text-success", alert: "text-destructive", treated: "text-warning", na: "text-muted-foreground" };

function BodyPartStatusIcon({ status }: { status: BodyPartStatus }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-success" aria-label="Normal" />;
  if (status === "treated") return <CheckCircle2 className="w-4 h-4 text-warning" aria-label="Monitoring" />;
  if (status === "na") return <MinusCircle className="w-4 h-4 text-muted-foreground" aria-label="Not available" />;
  return <AlertTriangle className="w-4 h-4 text-destructive" aria-label="Alert" />;
}

export function PatientSharedContent() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  return (
    <TooltipProvider>
      <Tabs defaultValue="diagnostics" className="w-full">
        <div className="px-6 border-b border-border mb-6">
          <TabsList className="bg-transparent border-none p-0 h-auto gap-6 justify-start w-full overflow-x-auto pb-3 shadow-none">
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-13px] shadow-none text-sm">
              Clinical Decision Support
            </TabsTrigger>
            <TabsTrigger value="anatomy" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-13px] shadow-none text-sm">
              Patient Longitudinal Record
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-13px] shadow-none text-sm">
              History & Records
            </TabsTrigger>
            <TabsTrigger value="ml" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-2 pb-3 mb-[-13px] shadow-none text-sm">
              ML Models
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-6 pb-20">
          {/* Diagnostics tab */}
          <TabsContent value="diagnostics" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h2 className="font-semibold text-foreground text-lg">AI Overview & Risk Flags</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-5 border-warning/30 bg-warning/5">
                  <h3 className="text-warning font-semibold mb-2 text-sm">Elevated Blood Pressure</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    Consistent trend of elevated blood pressure over 3 readings. Average 140/89. Recommended: Medication adjustment.
                  </p>
                  <div className="h-1.5 w-full bg-warning/20 rounded-full overflow-hidden">
                    <div className="h-full bg-warning w-[75%] rounded-full" />
                  </div>
                </Card>

                <Card className="p-5 border-destructive/30 bg-destructive/5">
                  <h3 className="text-destructive font-semibold mb-2 text-sm">Allergy Interaction Risk</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Penicillin allergy active. Prescriptions validated against cross-reactivity databases. Zero conflicts detected.
                  </p>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Summary</h3>
                <ul className="space-y-2.5">
                  {MOCK_PATIENT.summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Anatomy / Longitudinal Record tab */}
          <TabsContent value="anatomy" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BODY_PARTS.map((part) => {
                      const Icon = part.icon;
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5 text-primary" />
                              </div>
                              {part.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusColor[part.status]}`}>
                              <BodyPartStatusIcon status={part.status} />
                              {statusLabel[part.status]}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{part.detail}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="p-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Normal</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-warning" /> Monitoring</span>
                  <span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Alert</span>
                  <span className="inline-flex items-center gap-1.5"><MinusCircle className="w-3.5 h-3.5" /> N/A</span>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History tab — now a proper table */}
          <TabsContent value="history" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[60px]">Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_TIMELINE.map((event, i) => {
                      const Icon = event.icon;
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{event.date}</TableCell>
                          <TableCell>
                            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-primary" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{event.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{event.brief}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedReport(i)}>View</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>{event.title} — {event.date}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-md p-4 overflow-auto max-h-[60vh]">
                                    {event.detail}
                                  </pre>
                                  <Button className="w-full mt-4" variant="default" size="sm">
                                    <Download className="w-4 h-4 mr-2" /> Download PDF
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ML tab */}
          <TabsContent value="ml" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-28 h-28 rounded-full border-[10px] border-primary/15 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-[10px] border-primary border-t-transparent border-r-transparent -rotate-45" />
                    <span className="text-2xl font-bold text-foreground">87%</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">Hypertension Progression</h3>
                  <p className="text-xs text-muted-foreground">Probability of Stage 2 hypertension within 12 months if untreated.</p>
                </Card>

                <Card className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-28 h-28 flex items-end justify-center mb-4 gap-1.5 pb-3">
                    <div className="w-5 bg-muted rounded-t-sm h-[40%]" />
                    <div className="w-5 bg-muted rounded-t-sm h-[50%]" />
                    <div className="w-5 bg-primary/40 rounded-t-sm h-[70%]" />
                    <div className="w-5 bg-primary rounded-t-sm h-[90%]" />
                    <div className="absolute bottom-3 left-0 right-0 h-px bg-border" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">Medication Efficacy</h3>
                  <p className="text-xs text-muted-foreground">Lisinopril response curve vs typical demographic baseline.</p>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="text-sm font-semibold mb-3">Model Parameters</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-mono text-success font-medium">HIGH (0.92)</span>
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
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </TooltipProvider>
  );
}
