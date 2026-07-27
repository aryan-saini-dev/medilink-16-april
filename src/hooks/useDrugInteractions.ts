import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type DrugInteractionFlag = {
  severity: string;
  title: string;
  description: string;
  clinical_advice?: string | null;
  drug_a: string;
  drug_b: string;
};

export type DrugInteractionSource = {
  file_name?: string;
  report_title?: string;
  medications: string[];
};

export type DrugInteractionResult = {
  status: string;
  generated_at?: string;
  summaries_scanned?: number;
  medications: string[];
  sources?: DrugInteractionSource[];
  interactions: Array<Record<string, unknown>>;
  flags: DrugInteractionFlag[];
  count: number;
  has_major_or_contraindicated: boolean;
  message?: string;
};

export function useDrugInteractions() {
  return useQuery({
    queryKey: ["drug-interactions"],
    queryFn: async (): Promise<DrugInteractionResult> => {
      const res = await fetch("/api/drug-interactions");
      if (!res.ok) throw new Error("Failed to fetch drug interactions");
      return res.json();
    },
  });
}

export function useRefreshDrugInteractions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/drug-interactions/refresh", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to refresh drug interactions");
      }
      return res.json() as Promise<DrugInteractionResult>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drug-interactions"] });
    },
  });
}
