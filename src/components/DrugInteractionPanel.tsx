import { Loader2, Pill, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDrugInteractions,
  useRefreshDrugInteractions,
  type DrugInteractionFlag,
} from "@/hooks/useDrugInteractions";

const SEVERITY_STYLES: Record<string, { pill: string; border: string; bg: string }> = {
  contraindicated: {
    pill: "bg-red-600 text-white",
    border: "border-red-300",
    bg: "bg-red-50/70",
  },
  major: {
    pill: "bg-red-500/15 text-red-700 ring-1 ring-red-200",
    border: "border-red-200",
    bg: "bg-red-50/50",
  },
  moderate: {
    pill: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-200",
    border: "border-amber-200",
    bg: "bg-amber-50/50",
  },
  minor: {
    pill: "bg-slate-500/10 text-slate-700 ring-1 ring-slate-200",
    border: "border-slate-200",
    bg: "bg-slate-50/60",
  },
};

function FlagCard({ flag }: { flag: DrugInteractionFlag }) {
  const style = SEVERITY_STYLES[flag.severity?.toLowerCase()] || SEVERITY_STYLES.minor;
  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-foreground text-sm leading-snug">{flag.title}</h4>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.pill}`}>
          {flag.severity}
        </span>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed mb-2">{flag.description}</p>
      {flag.clinical_advice && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground/80">Advice: </span>
          {flag.clinical_advice}
        </p>
      )}
    </div>
  );
}

export function DrugInteractionPanel() {
  const { data, isLoading, error, refetch, isFetching } = useDrugInteractions();
  const refresh = useRefreshDrugInteractions();

  const handleRefresh = async () => {
    try {
      await refresh.mutateAsync();
    } catch {
      await refetch();
    }
  };

  const busy = isLoading || isFetching || refresh.isPending;
  const flags = data?.flags ?? [];
  const medications = data?.medications ?? [];
  const hasCritical = Boolean(data?.has_major_or_contraindicated);

  return (
    <div className="bg-card border-2 border-foreground rounded-xl p-5 shadow-sticker space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-[#1E5AA8]" />
            <h3 className="font-display font-bold text-foreground">Drug Interaction Check</h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Medications extracted from uploaded report summaries and checked with clinical-ddi-check.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-foreground shadow-pop-soft"
          onClick={handleRefresh}
          disabled={busy}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          Re-check
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load drug interaction results. Restart the dev server and try Re-check.
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border-2 p-4 flex items-start gap-3 ${
              hasCritical
                ? "border-red-300 bg-red-50/60"
                : flags.length
                  ? "border-amber-300 bg-amber-50/50"
                  : "border-emerald-300 bg-emerald-50/50"
            }`}
          >
            {hasCritical || flags.length ? (
              <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${hasCritical ? "text-red-600" : "text-amber-600"}`} />
            ) : (
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{data?.message || "No results yet."}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scanned {data?.summaries_scanned ?? 0} report summar{(data?.summaries_scanned ?? 0) === 1 ? "y" : "ies"}
                {data?.generated_at ? ` · Updated ${new Date(data.generated_at).toLocaleString()}` : ""}
              </p>
            </div>
          </div>

          {medications.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Medications detected
              </p>
              <div className="flex flex-wrap gap-2">
                {medications.map((med) => (
                  <span
                    key={med}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>
          )}

          {flags.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Flagged interactions ({flags.length})
              </p>
              {flags.map((flag, i) => (
                <FlagCard key={`${flag.drug_a}-${flag.drug_b}-${i}`} flag={flag} />
              ))}
            </div>
          ) : medications.length > 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No conflicting drug-drug interactions were found for the current medication set in the DDI database.
            </div>
          ) : null}

          {data?.sources && data.sources.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Source reports
              </p>
              <ul className="space-y-1.5">
                {data.sources.map((source, i) => (
                  <li key={`${source.file_name}-${i}`} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-foreground font-medium shrink-0">
                      {source.report_title || source.file_name}
                    </span>
                    <span>· {source.medications.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
