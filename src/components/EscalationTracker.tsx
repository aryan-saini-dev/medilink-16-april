import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ChatMsg = {
  id: number;
  role: "ai" | "user";
  text: string;
};

type Stage = "idle" | "intake" | "analyzing" | "result";
type RiskLevel = "low" | "moderate" | "high";

type Step = {
  ai: string;
  options: string[];
  // Each option carries weight added to risk score (0–100 scale)
  weights: number[];
};

// Mocked symptom-driven flow inspired by the Anita / kidney example
const FLOW: Step[] = [
  {
    ai: "Hi Anita. I'm your MediLink AI escalation assistant. I can see your records show Type 2 Diabetes (8 years), HbA1c 7.4%, and mild hypertension. To get started — how have you been feeling overall in the past 2 weeks?",
    options: [
      "Honestly, I feel completely fine.",
      "A little more tired than usual.",
      "Quite unwell — something feels off.",
    ],
    weights: [10, 25, 55],
  },
  {
    ai: "Good to know. Diabetes can quietly affect taste, smell, and appetite long before other symptoms appear. Have you noticed any unusual taste in your mouth recently — for example when eating or drinking?",
    options: [
      "No, taste feels normal.",
      "Slight metallic or bitter taste, especially with tea or water.",
      "Strong, persistent metallic taste all day.",
    ],
    weights: [0, 35, 50],
  },
  {
    ai: "Noted — a metallic taste in diabetic patients can sometimes signal changes in kidney filtration. Have you also noticed any of these in the last 2 weeks? Swelling in ankles, foamy urine, itchy skin, or waking up at night to urinate more than usual?",
    options: [
      "None of those.",
      "Some foamy urine and waking up 2–3× at night.",
      "Swollen ankles, foamy urine, and itchy skin.",
    ],
    weights: [5, 30, 45],
  },
  {
    ai: "Thank you. One more — your last lab panel was 4 months ago. Have you had any nausea, loss of appetite, or shortness of breath when climbing stairs?",
    options: [
      "No, none of that.",
      "Mild nausea and reduced appetite.",
      "Yes — nausea, poor appetite, and breathless on stairs.",
    ],
    weights: [0, 30, 40],
  },
];

function riskFromScore(score: number): RiskLevel {
  if (score >= 110) return "high";
  if (score >= 60) return "moderate";
  return "low";
}

const RISK_META: Record<RiskLevel, { label: string; pill: string; ring: string; bar: string; tone: string }> = {
  low: {
    label: "Low risk",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
    tone: "text-emerald-700",
  },
  moderate: {
    label: "Moderate risk · monitor",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "ring-amber-200",
    bar: "bg-amber-500",
    tone: "text-amber-700",
  },
  high: {
    label: "HIGH RISK · escalate",
    pill: "bg-red-50 text-red-700 ring-red-200",
    ring: "ring-red-200",
    bar: "bg-red-500",
    tone: "text-red-700",
  },
};

export function EscalationTracker() {
  const [stage, setStage] = useState<Stage>("idle");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const start = () => {
    setStage("intake");
    setStepIdx(0);
    setScore(0);
    setMessages([{ id: 0, role: "ai", text: FLOW[0].ai }]);
  };

  const reset = () => {
    setStage("idle");
    setMessages([]);
    setStepIdx(0);
    setScore(0);
    setAnalyzeStep(0);
  };

  const choose = (optionIdx: number) => {
    const current = FLOW[stepIdx];
    const userText = current.options[optionIdx];
    const weight = current.weights[optionIdx];

    setMessages((m) => [...m, { id: m.length, role: "user", text: userText }]);
    const newScore = score + weight;
    setScore(newScore);

    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const nextIdx = stepIdx + 1;
      if (nextIdx < FLOW.length) {
        setStepIdx(nextIdx);
        setMessages((m) => [...m, { id: m.length, role: "ai", text: FLOW[nextIdx].ai }]);
      } else {
        // run analysis
        setStage("analyzing");
        runAnalysis();
      }
    }, 900);
  };

  const runAnalysis = () => {
    setAnalyzeStep(0);
    const t1 = setTimeout(() => setAnalyzeStep(1), 700);
    const t2 = setTimeout(() => setAnalyzeStep(2), 1500);
    const t3 = setTimeout(() => setAnalyzeStep(3), 2300);
    const t4 = setTimeout(() => setStage("result"), 3100);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  };

  const risk = riskFromScore(score);
  const riskMeta = RISK_META[risk];

  const handleDownload = () => {
    toast({
      title: "Symptom report generated",
      description: "PDF queued for download (mock). Forward to your physician.",
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[#1E5AA8]" />
            <h2 className="font-display font-bold text-foreground text-lg leading-tight">AI Escalation Tracker</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            A conversational AI that cross-references your live symptoms with your medical history to detect early
            escalation patterns — before they become emergencies.
          </p>
        </div>
        {stage !== "idle" && (
          <Button variant="outline" size="sm" onClick={reset}>
            Reset session
          </Button>
        )}
      </div>

      {/* Idle state — Start screen */}
      {stage === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[#1E5AA8]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-[#1E5AA8]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Run an escalation check</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            The AI will ask a few short questions and compare your answers against your chronic conditions, recent labs,
            and known disease progression patterns.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto text-left">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">1. Conversational intake</div>
              <p className="text-xs text-muted-foreground">~2 min, plain-language questions.</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">2. Pattern matching</div>
              <p className="text-xs text-muted-foreground">Cross-checked with your history.</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-semibold text-foreground mb-1">3. Risk + report</div>
              <p className="text-xs text-muted-foreground">Tag and PDF for your doctor.</p>
            </div>
          </div>

          <Button size="lg" onClick={start} className="bg-[#1E5AA8] hover:bg-[#174a8a] text-white">
            <Activity className="w-4 h-4 mr-2" /> Start escalation check
          </Button>
        </motion.div>
      )}

      {/* Intake / chat */}
      {stage === "intake" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[#1E5AA8]/5">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#1E5AA8]" />
              <span className="text-xs font-semibold text-foreground">MediLink Escalation AI</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Q {Math.min(stepIdx + 1, FLOW.length)} / {FLOW.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-muted">
            <div
              className="h-full bg-[#1E5AA8] transition-all duration-500"
              style={{ width: `${((stepIdx + (thinking ? 0.5 : 0)) / FLOW.length) * 100}%` }}
            />
          </div>

          <div ref={scrollRef} className="max-h-[360px] overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-[#1E5AA8]/10 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#1E5AA8]" />
                    </div>
                  )}
                  <div
                    className={`text-sm leading-relaxed rounded-xl px-3 py-2 max-w-[80%] ${
                      m.role === "user"
                        ? "bg-[#1E5AA8] text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#1E5AA8]/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#1E5AA8]" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          {!thinking && stepIdx < FLOW.length && (
            <div className="border-t border-border bg-background p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                Choose the closest answer
              </p>
              {FLOW[stepIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-lg border border-border bg-card hover:border-[#1E5AA8]/50 hover:bg-[#1E5AA8]/5 transition-colors flex items-center justify-between gap-2"
                >
                  <span>{opt}</span>
                  <Send className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Analyzing */}
      {stage === "analyzing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <Loader2 className="w-10 h-10 text-[#1E5AA8] animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-4">Analyzing patterns…</h3>
          <div className="max-w-sm mx-auto space-y-2 text-left">
            {[
              "Cross-referencing chronic conditions (T2DM, HTN)",
              "Matching symptoms to known progression patterns",
              "Scoring against last 12-month lab trends (HbA1c, eGFR)",
              "Generating risk stratification",
            ].map((label, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs font-mono transition-colors ${
                  analyzeStep >= i ? "text-foreground" : "text-muted-foreground/40"
                }`}
              >
                {analyzeStep > i ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : analyzeStep === i ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#1E5AA8] animate-spin" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                )}
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      {stage === "result" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Risk banner */}
          <div className={`rounded-2xl border-2 p-5 ${
            risk === "high" ? "border-red-300 bg-red-50/60"
              : risk === "moderate" ? "border-amber-300 bg-amber-50/60"
              : "border-emerald-300 bg-emerald-50/60"
          }`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  risk === "high" ? "bg-red-500" : risk === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                }`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ring-1 ${riskMeta.pill} ${riskMeta.ring} mb-2`}>
                    {riskMeta.label}
                  </span>
                  <h3 className={`text-xl font-display font-bold ${riskMeta.tone}`}>
                    {risk === "high" && "Possible Stage 3 CKD progression"}
                    {risk === "moderate" && "Early warning signals detected"}
                    {risk === "low" && "No escalation indicators"}
                  </h3>
                  <p className="text-sm text-foreground/80 mt-1 max-w-2xl">
                    {risk === "high" &&
                      "Your symptoms (metallic taste, foamy urine, ankle swelling, nocturia) combined with diabetes history and last eGFR (62 mL/min) match patterns associated with Stage 3 chronic kidney disease. We strongly recommend you contact your physician within 24 hours."}
                    {risk === "moderate" &&
                      "Some of your symptoms could indicate early changes in kidney function or glycemic control. Not urgent, but worth a check-up in the next 1–2 weeks."}
                    {risk === "low" &&
                      "Based on your responses and recent records, no escalation pattern was detected. Keep monitoring as usual."}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Risk score</div>
                <div className={`text-3xl font-display font-bold ${riskMeta.tone}`}>{Math.min(score, 200)}</div>
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${riskMeta.bar}`} style={{ width: `${Math.min((score / 200) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Symptoms detected
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  "Persistent metallic taste",
                  "Foamy urine + nocturia",
                  "Ankle swelling",
                  "Reduced appetite",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${riskMeta.bar}`} />
                    <span className="text-foreground/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Pattern match
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-foreground/80">CKD Stage 3</span><span className="font-mono font-semibold text-red-600">87%</span></li>
                <li className="flex justify-between"><span className="text-foreground/80">Diabetic nephropathy</span><span className="font-mono font-semibold text-amber-600">71%</span></li>
                <li className="flex justify-between"><span className="text-foreground/80">Uremia indicators</span><span className="font-mono font-semibold text-amber-600">62%</span></li>
                <li className="flex justify-between"><span className="text-foreground/80">Hypertensive crisis</span><span className="font-mono font-semibold text-emerald-600">12%</span></li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Recommended action
              </h4>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="font-mono text-[#1E5AA8] font-bold">1.</span><span className="text-foreground/80">Book nephrology consult within 24h.</span></li>
                <li className="flex gap-2"><span className="font-mono text-[#1E5AA8] font-bold">2.</span><span className="text-foreground/80">Order: BMP, eGFR, urine ACR, cystatin C.</span></li>
                <li className="flex gap-2"><span className="font-mono text-[#1E5AA8] font-bold">3.</span><span className="text-foreground/80">Hold metformin pending eGFR result.</span></li>
                <li className="flex gap-2"><span className="font-mono text-[#1E5AA8] font-bold">4.</span><span className="text-foreground/80">Tag chart: HIGH RISK — CKD watch.</span></li>
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} className="bg-[#1E5AA8] hover:bg-[#174a8a] text-white">
              <Download className="w-4 h-4 mr-2" /> Download symptom PDF
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" /> Share with physician
            </Button>
            <Button variant="ghost" onClick={reset}>Run new check</Button>
          </div>

          <p className="text-[11px] text-muted-foreground italic">
            AI-generated assessment based on conversational intake + retrieval over verified records (RAG). Not a substitute for clinical diagnosis.
          </p>
        </motion.div>
      )}
    </div>
  );
}
