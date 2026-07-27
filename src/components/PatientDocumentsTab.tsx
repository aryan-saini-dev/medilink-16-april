import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { FileText, Image, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDocuments, getDocumentFileUrl } from "@/hooks/useDocuments";

function FileIcon({ name, type }: { name: string; type: "image" | "document" }) {
  if (type === "image") {
    return (
      <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
        <img
          src={getDocumentFileUrl(name)}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg border border-border bg-primary/10 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-primary" />
    </div>
  );
}

export function PatientDocumentsTab() {
  const [search, setSearch] = useState("");
  const { data: documents, isLoading, error } = useDocuments();

  const filtered = useMemo(() => {
    if (!documents) return [];
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [documents, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header row — title + search (reference layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">Documents</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All uploaded medical records and files
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-muted/50 border-border"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border-2 border-foreground bg-card shadow-sticker overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            Failed to load documents. Make sure the dev server is running.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              {search ? "No documents match your search" : "No documents uploaded yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use the Upload documents button above to add files.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-5">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Modified
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5">
                  Size
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow
                  key={doc.name}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                  onClick={() => window.open(getDocumentFileUrl(doc.name), "_blank")}
                >
                  <TableCell className="pl-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon name={doc.name} type={doc.type} />
                      <span className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(doc.modified), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground text-right pr-5 whitespace-nowrap">
                    {doc.sizeFormatted}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>
  );
}
