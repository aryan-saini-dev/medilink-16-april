import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AIChatPanelProps = {
  /** Audience changes the greeting + sample exchange copy */
  audience?: "clinician" | "patient";
  /** Patient name shown in the greeting */
  patientName?: string;
  /** Render as a floating bottom-right launcher (used on patient dashboard) */
  floating?: boolean;
  /** External control (used on clinical portal sidebar trigger) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the built-in trigger button (for externally controlled mode) */
  hideTrigger?: boolean;
};

export function AIChatPanel({
  audience = "clinician",
  patientName = "the patient",
  floating = false,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: AIChatPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? !!controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) { setLoading(true); return; }
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, [open]);

  const greeting = audience === "patient"
    ? `Hi ${patientName}! I'm your MediLink AI. Ask me anything about your records, medications, or recent results.`
    : `Hello Doctor. I am ready to assist with ${patientName}'s records. How can I help?`;

  const sampleUserMsg = audience === "patient"
    ? "Why was my Lisinopril dose increased?"
    : "Summarize the patient's recent vitals trend and medication logic.";

  const sampleAIBody = audience === "patient" ? (
    <>
      <p>Here's a plain-language summary:</p>
      <ul className="list-disc pl-3 space-y-0.5 my-1">
        <li>Your home BP readings have been trending up (avg 140/89).</li>
        <li>Your doctor increased <strong>Lisinopril 10mg → 20mg</strong> to bring it back into a safe range.</li>
        <li>No conflicts with your Penicillin allergy.</li>
      </ul>
      <p className="text-[10px] text-white/70 italic border-t border-white/20 pt-1.5">Always confirm clinical questions with your physician.</p>
    </>
  ) : (
    <>
      <p>Analysis for {patientName}:</p>
      <ul className="list-disc pl-3 space-y-0.5 my-1">
        <li><strong>Vitals:</strong> BP increased 130/82 → 142/91 over 3 months. HR and SpO2 stable.</li>
        <li><strong>Medication:</strong> Lisinopril dosage increased per protocol. No conflicts detected.</li>
      </ul>
      <p className="text-[10px] text-white/70 italic border-t border-white/20 pt-1.5">AI-generated summary using retrieval from verified records (RAG).</p>
    </>
  );

  return (
    <>
      {!hideTrigger && floating && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold text-sm shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <MessageSquare className="w-4 h-4" />
          Open AI Chat
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on patient/floating mode for focus */}
            {floating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/20 z-40"
                onClick={() => setOpen(false)}
              />
            )}

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={
                floating
                  ? "fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#1E5AA8] z-50 flex flex-col shadow-2xl"
                  : "absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-[#1E5AA8] border-l border-[#174a8a] z-50 flex flex-col shadow-2xl"
              }
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/15 bg-[#174a8a] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs text-white">
                    {audience === "patient" ? "MediLink AI Assistant" : "Clinical AI Assistant"}
                  </h3>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/15 hover:text-white" onClick={() => setOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
                <div className="bg-white/10 text-white p-2.5 rounded-lg rounded-tl-none w-[85%] text-xs leading-relaxed">
                  {greeting}
                </div>

                <div className="bg-white text-[#1E5AA8] font-medium p-2.5 rounded-lg rounded-tr-none w-[85%] text-xs self-end">
                  {sampleUserMsg}
                </div>

                {loading ? (
                  <div className="bg-white/10 p-2.5 flex items-center gap-1.5 w-16 rounded-lg rounded-tl-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 text-white p-2.5 rounded-lg rounded-tl-none w-[90%] text-xs space-y-1.5 leading-relaxed"
                  >
                    {sampleAIBody}
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/15 bg-[#174a8a] flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 h-9 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  disabled
                />
                <Button size="sm" className="h-9 text-xs bg-white text-[#1E5AA8] hover:bg-white/90 font-semibold rounded-full px-4" disabled>
                  Send
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
