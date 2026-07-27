import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Image } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DocumentFile = {
  name: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  type: "image" | "document";
  extension: string;
  summaryText: string | null;
  summaryTitle: string | null;
  summaryStatus: string | null;
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<DocumentFile[]> => {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      return data.files;
    },
  });
}

export function useUploadDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const payload = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
        }))
      );
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      return res.json() as Promise<{
        uploaded: string[];
        count: number;
        processing: Array<{ name: string; ok: boolean; error?: string }>;
      }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function getDocumentFileUrl(name: string): string {
  return `/api/documents/file?name=${encodeURIComponent(name)}`;
}

export type TimelineItem = {
  id: string;
  date: string;
  type: string;
  title: string;
  brief: string;
  detail: string;
  icon: LucideIcon;
  isUploaded?: boolean;
  fileName?: string;
};

function formatDocumentTitle(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "").replace(/[-_()]/g, " ").trim();
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDocumentIcon(doc: DocumentFile): LucideIcon {
  if (doc.type === "image") return Image;
  return FileText;
}

function getPlaceholderDetail(doc: DocumentFile): string {
  const uploadedAt = format(new Date(doc.modified), "MMM d, yyyy 'at' h:mm a");
  return `Uploaded Document Report:
─────────────────────
File:         ${doc.name}
Type:         ${doc.extension.toUpperCase()}
Size:         ${doc.sizeFormatted}
Uploaded:     ${uploadedAt}
Status:       Pending AI processing

Summary:
─────────────────────
This document was uploaded to your medical records inbox.
Full report extraction and clinical indexing are in progress.

Placeholder findings (temporary):
• Document received and stored securely
• Awaiting automated content analysis
• Results will appear here once processing completes

Note: This is temporary placeholder data. Confirm all clinical
information with your healthcare provider.`;
}

export function documentToTimelineItem(doc: DocumentFile): TimelineItem {
  const extLabel = doc.extension.toUpperCase();
  const failed = doc.summaryStatus === "processing_failed";
  const pending = !doc.summaryText;
  const brief = failed
    ? `${extLabel} · ${doc.sizeFormatted} · AI summary pending — processing issue`
    : pending
      ? `${extLabel} · ${doc.sizeFormatted} · Awaiting AI summary`
      : `${extLabel} · ${doc.sizeFormatted} · Uploaded document`;

  return {
    id: `doc-${doc.name}`,
    date: format(new Date(doc.modified), "MMM d, yyyy"),
    type: "upload",
    title: doc.summaryTitle || formatDocumentTitle(doc.name),
    brief,
    detail: doc.summaryText || getPlaceholderDetail(doc),
    icon: getDocumentIcon(doc),
    isUploaded: true,
    fileName: doc.name,
  };
}
