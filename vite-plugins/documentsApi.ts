import type { Connect, Plugin } from "vite";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";

const DOCUMENTS_DIR = path.resolve(process.cwd(), "Documents");
const SUMMARIES_DIR = path.resolve(process.cwd(), "DocumentSummaries");
const DRUG_INTERACTIONS_DIR = path.resolve(process.cwd(), "DrugInteractions");
const DRUG_INTERACTIONS_FILE = path.join(DRUG_INTERACTIONS_DIR, "latest.json");
const PROCESS_SCRIPT = path.resolve(process.cwd(), "scripts", "process_document.py");
const DDI_SCRIPT = path.resolve(process.cwd(), "scripts", "drug-interaction-check.py");
const ENV_FILE = path.resolve(process.cwd(), ".env");

function loadEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {};
  const env: Record<string, string> = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function ensureDocumentsDir() {
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  }
}

function ensureSummariesDir() {
  if (!fs.existsSync(SUMMARIES_DIR)) {
    fs.mkdirSync(SUMMARIES_DIR, { recursive: true });
  }
}

function ensureDrugInteractionsDir() {
  if (!fs.existsSync(DRUG_INTERACTIONS_DIR)) {
    fs.mkdirSync(DRUG_INTERACTIONS_DIR, { recursive: true });
  }
}

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
}

function uniqueFilename(name: string): string {
  const safe = sanitizeFilename(name);
  const ext = path.extname(safe);
  const base = path.basename(safe, ext);
  let candidate = safe;
  let counter = 1;
  while (fs.existsSync(path.join(DOCUMENTS_DIR, candidate))) {
    candidate = `${base} (${counter})${ext}`;
    counter++;
  }
  return candidate;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "application/octet-stream";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function getSummaryPath(fileName: string): string {
  return path.join(SUMMARIES_DIR, `${fileName}.json`);
}

function readSummary(fileName: string) {
  const summaryPath = getSummaryPath(fileName);
  if (!fs.existsSync(summaryPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(summaryPath, "utf-8")) as {
      summary_text?: string;
      report_title?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    };
  } catch {
    return null;
  }
}

function runPythonScript(scriptPath: string, args: string[], timeoutMs = 120000) {
  const pythonCommands = process.platform === "win32" ? ["python", "py"] : ["python3", "python"];
  let lastError = "Python executable not found.";
  const scriptName = path.basename(scriptPath);

  for (const command of pythonCommands) {
    console.log(`\n[MediLink] Starting ${scriptName} via ${command} ...`);
    const result = spawnSync(command, [scriptPath, ...args], {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: timeoutMs,
      env: { ...process.env, ...loadEnvFile() },
    });

    if (result.stderr) {
      console.log(result.stderr.trimEnd());
    }
    if (result.stdout) {
      // Keep JSON result visible, but label it clearly.
      console.log(`[MediLink] ${scriptName} result: ${result.stdout.trim()}`);
    }

    if (result.error) {
      lastError = result.error.message;
      console.error(`[MediLink] ERROR launching ${scriptName}: ${lastError}`);
      continue;
    }

    if (result.status === 0) {
      console.log(`[MediLink] ${scriptName} completed successfully\n`);
      return { ok: true as const, command, stdout: result.stdout?.trim() || "" };
    }

    lastError = result.stderr?.trim() || result.stdout?.trim() || `Processor exited with code ${result.status}`;
    console.error(`[MediLink] ERROR in ${scriptName}: ${lastError}`);
  }

  return { ok: false as const, error: lastError };
}

function triggerDocumentProcessor(filePath: string) {
  return runPythonScript(PROCESS_SCRIPT, [filePath, SUMMARIES_DIR], 120000);
}

function triggerDrugInteractionCheck() {
  ensureDrugInteractionsDir();
  return runPythonScript(DDI_SCRIPT, [SUMMARIES_DIR, DRUG_INTERACTIONS_FILE], 180000);
}

function readDrugInteractions() {
  if (!fs.existsSync(DRUG_INTERACTIONS_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(DRUG_INTERACTIONS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function documentsMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction
) {
  const url = req.url ?? "";

  // Drug interaction endpoints
  if (url.startsWith("/api/drug-interactions")) {
    ensureDrugInteractionsDir();
    ensureSummariesDir();

    // GET /api/drug-interactions — return latest (refresh if missing)
    if (req.method === "GET" && (url === "/api/drug-interactions" || url === "/api/drug-interactions/")) {
      let data = readDrugInteractions();
      if (!data) {
        triggerDrugInteractionCheck();
        data = readDrugInteractions();
      }
      if (!data) {
        sendJson(res, 200, {
          status: "unavailable",
          medications: [],
          interactions: [],
          flags: [],
          count: 0,
          has_major_or_contraindicated: false,
          message: "Drug interaction results are not available yet.",
        });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    // POST /api/drug-interactions/refresh — re-run checker
    if (req.method === "POST" && url.startsWith("/api/drug-interactions/refresh")) {
      const result = triggerDrugInteractionCheck();
      const data = readDrugInteractions();
      if (!result.ok) {
        sendJson(res, 500, { error: result.error, data });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    return next();
  }

  if (!url.startsWith("/api/documents")) {
    return next();
  }

  ensureDocumentsDir();
  ensureSummariesDir();

  // GET /api/documents — list all files
  if (req.method === "GET" && (url === "/api/documents" || url === "/api/documents/")) {
    try {
      const entries = fs.readdirSync(DOCUMENTS_DIR).filter((f) => !f.startsWith("."));
      const files = entries.map((name) => {
        const filePath = path.join(DOCUMENTS_DIR, name);
        const stats = fs.statSync(filePath);
        const ext = path.extname(name).toLowerCase();
        const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext);
        let summary = readSummary(name);
        if (!summary) {
          triggerDocumentProcessor(filePath);
          summary = readSummary(name);
        }
        return {
          name,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          modified: stats.mtime.toISOString(),
          type: isImage ? "image" : "document",
          extension: ext.replace(".", "") || "file",
          summaryText: summary?.summary_text ?? null,
          summaryTitle: summary?.report_title ?? null,
          summaryStatus: summary?.status ?? null,
        };
      });
      files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      sendJson(res, 200, { files });
    } catch (err) {
      sendJson(res, 500, { error: "Failed to list documents" });
    }
    return;
  }

  // GET /api/documents/file?name=... — serve a file
  if (req.method === "GET" && url.startsWith("/api/documents/file")) {
    const params = new URL(url, "http://localhost").searchParams;
    const name = params.get("name");
    if (!name) {
      sendJson(res, 400, { error: "Missing file name" });
      return;
    }
    const safe = sanitizeFilename(name);
    const filePath = path.join(DOCUMENTS_DIR, safe);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", getMimeType(safe));
    res.setHeader("Content-Disposition", `inline; filename="${safe}"`);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // POST /api/documents — upload files (JSON body with base64)
  if (req.method === "POST" && (url === "/api/documents" || url === "/api/documents/")) {
    readBody(req)
      .then((body) => {
        const { files } = JSON.parse(body) as {
          files: { name: string; data: string }[];
        };
        if (!files?.length) {
          sendJson(res, 400, { error: "No files provided" });
          return;
        }
        const uploaded: string[] = [];
        const processing: Array<{ name: string; ok: boolean; error?: string }> = [];
        for (const file of files) {
          const filename = uniqueFilename(file.name);
          const buffer = Buffer.from(file.data, "base64");
          const savedPath = path.join(DOCUMENTS_DIR, filename);
          fs.writeFileSync(savedPath, buffer);
          uploaded.push(filename);
          const processorResult = triggerDocumentProcessor(savedPath);
          processing.push(
            processorResult.ok
              ? { name: filename, ok: true }
              : { name: filename, ok: false, error: processorResult.error }
          );
        }

        // Re-check drug interactions across all summaries after uploads
        const ddiResult = triggerDrugInteractionCheck();

        sendJson(res, 200, {
          uploaded,
          count: uploaded.length,
          processing,
          drugInteractionCheck: ddiResult.ok
            ? { ok: true }
            : { ok: false, error: ddiResult.error },
        });
      })
      .catch(() => {
        sendJson(res, 500, { error: "Failed to upload documents" });
      });
    return;
  }

  next();
}

export function documentsApiPlugin(): Plugin {
  return {
    name: "documents-api",
    configureServer(server) {
      server.middlewares.use(documentsMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(documentsMiddleware);
    },
  };
}
