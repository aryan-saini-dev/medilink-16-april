#!/usr/bin/env python3
"""
drug-interaction-check.py

Collects medical document summaries from DocumentSummaries/,
extracts medications mentioned across reports, and flags
drug-drug interactions using clinical-ddi-check.

Usage:
  python scripts/drug-interaction-check.py [summaries_dir] [output_path]
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

from clinical_ddi_check import drug_interaction_check, normalize_medication_names
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SUMMARIES_DIR = ROOT_DIR / "DocumentSummaries"
DEFAULT_OUTPUT_PATH = ROOT_DIR / "DrugInteractions" / "latest.json"


def log(level: str, message: str) -> None:
    stamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{stamp}] [{level}] {message}", file=sys.stderr, flush=True)


def log_info(message: str) -> None:
    log("INFO", message)


def log_step(message: str) -> None:
    log("STEP", message)


def log_warn(message: str) -> None:
    log("WARN", message)


def log_error(message: str) -> None:
    log("ERROR", message)


def log_ok(message: str) -> None:
    log("OK", message)

# Common medication name patterns found in clinical notes / plans
KNOWN_DRUGS = [
    "amlodipine", "metformin", "lisinopril", "atorvastatin", "aspirin",
    "ibuprofen", "warfarin", "losartan", "telmisartan", "enalapril",
    "ramipril", "glimepiride", "glipizide", "insulin", "omeprazole",
    "pantoprazole", "clopidogrel", "atenolol", "metoprolol", "carvedilol",
    "hydrochlorothiazide", "furosemide", "spironolactone", "prednisone",
    "amoxicillin", "azithromycin", "ciprofloxacin", "paracetamol",
    "acetaminophen", "tramadol", "gabapentin", "sertraline", "fluoxetine",
    "rosuvastatin", "simvastatin", "dapagliflozin", "empagliflozin",
    "sitagliptin", "vildagliptin", "telmisartan", "nifedipine",
    "contrast media", "contrast_media", "potassium", "vitamin d",
]

DRUG_DOSE_PATTERN = re.compile(
    r"\b("
    r"amlodipine|metformin|lisinopril|atorvastatin|aspirin|ibuprofen|"
    r"warfarin|losartan|telmisartan|enalapril|ramipril|glimepiride|"
    r"glipizide|insulin|omeprazole|pantoprazole|clopidogrel|atenolol|"
    r"metoprolol|carvedilol|hydrochlorothiazide|furosemide|spironolactone|"
    r"prednisone|amoxicillin|azithromycin|ciprofloxacin|paracetamol|"
    r"acetaminophen|tramadol|gabapentin|sertraline|fluoxetine|"
    r"rosuvastatin|simvastatin|dapagliflozin|empagliflozin|sitagliptin|"
    r"vildagliptin|nifedipine|potassium|vitamin\s*d"
    r")\b(?:\s*\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|units?)(?:\b|/day|/d)?)?",
    re.IGNORECASE,
)

STARTED_PATTERN = re.compile(
    r"(?:started|start|prescribed|continue|taking|on|dose(?:d)?(?:\s+of)?)\s+"
    r"([A-Za-z][A-Za-z\s\-]{1,40}?)(?:\s+\d+(?:\.\d+)?\s*(?:mg|mcg|g))?",
    re.IGNORECASE,
)


def load_environment() -> None:
    load_dotenv(ROOT_DIR / ".env")


def load_summaries(summaries_dir: Path) -> list[dict]:
    records = []
    if not summaries_dir.exists():
        log_warn(f"Summaries directory does not exist yet: {summaries_dir}")
        return records
    for path in sorted(summaries_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            data["_summary_path"] = str(path)
            records.append(data)
        except Exception as exc:
            log_warn(f"Skipping unreadable summary file {path.name}: {exc}")
            continue
    return records


def collect_text_blobs(record: dict) -> str:
    parts: list[str] = []
    if record.get("summary_text"):
        parts.append(str(record["summary_text"]))
    structured = record.get("structured_data") or {}
    if isinstance(structured, dict):
        for key in ("plan", "orders", "assessment", "chief_complaint", "report_title"):
            if structured.get(key):
                parts.append(str(structured[key]))
        findings = structured.get("key_findings") or []
        if isinstance(findings, list):
            parts.extend(str(x) for x in findings)
    return "\n".join(parts)


def extract_drugs_regex(text: str) -> list[str]:
    found: list[str] = []
    for match in DRUG_DOSE_PATTERN.finditer(text):
        name = re.sub(r"\s+", " ", match.group(0)).strip()
        found.append(name)
    for match in STARTED_PATTERN.finditer(text):
        candidate = match.group(1).strip(" .,:;")
        lower = candidate.lower()
        for known in KNOWN_DRUGS:
            if known in lower:
                found.append(candidate)
                break
    return found


def extract_drugs_with_llm(combined_summaries: str) -> list[str]:
    """Optional Gemini pass to extract medication names from report summaries."""
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip().strip('"').strip("'")
    if not api_key or not combined_summaries.strip():
        log_info("Skipping Gemini medication extraction (no API key or empty summaries)")
        return []

    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_google_genai import ChatGoogleGenerativeAI
        from pydantic import BaseModel, Field

        class MedicationList(BaseModel):
            medications: list[str] = Field(
                description="Unique medication names mentioned across reports (without dose if possible)"
            )

        log_step("Calling Gemini to refine medication list from summaries")
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
        )
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Extract all medications / drugs mentioned in these clinical report summaries. "
                    "Return only real drug names (brand or generic). Exclude vitamins unless clearly "
                    "prescribed as therapy. Do not invent medications.",
                ),
                ("human", "{text}"),
            ]
        )
        chain = prompt | llm.with_structured_output(MedicationList)
        result = chain.invoke({"text": combined_summaries[:12000]})
        meds = [m.strip() for m in result.medications if m and m.strip()]
        log_ok(f"Gemini medication extraction found {len(meds)} drug(s)")
        return meds
    except Exception as exc:
        log_warn(f"Gemini medication extraction failed, continuing with regex-only results: {exc}")
        return []


def unique_preserve(items: list[str]) -> list[str]:
    seen = set()
    out = []
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        # skip obvious non-drugs
        if key in {"not clearly stated", "none", "n/a", "na"}:
            continue
        seen.add(key)
        out.append(item.strip())
    return out


def extract_medications(records: list[dict]) -> tuple[list[str], list[dict]]:
    sources: list[dict] = []
    all_drugs: list[str] = []
    text_blobs: list[str] = []

    log_step(f"Scanning {len(records)} summary file(s) for medications")
    for record in records:
        text = collect_text_blobs(record)
        text_blobs.append(f"### {record.get('file_name', 'unknown')}\n{text}")
        drugs = extract_drugs_regex(text)
        if drugs:
            unique_drugs = unique_preserve(drugs)
            log_info(
                f"  - {record.get('file_name', 'unknown')}: {', '.join(unique_drugs)}"
            )
            sources.append(
                {
                    "file_name": record.get("file_name"),
                    "report_title": record.get("report_title"),
                    "medications": unique_drugs,
                }
            )
            all_drugs.extend(drugs)
        else:
            log_info(f"  - {record.get('file_name', 'unknown')}: no medications detected")

    llm_drugs = extract_drugs_with_llm("\n\n".join(text_blobs))
    all_drugs.extend(llm_drugs)

    medications = unique_preserve(all_drugs)
    log_ok(f"Unique medications collected: {medications if medications else 'none'}")

    # Prefer RxNorm-normalized names when available
    if medications:
        log_step("Normalizing medication names via clinical-ddi-check / RxNorm")
        norm = normalize_medication_names(medications)
        if "error_code" not in norm and norm.get("normalized"):
            log_ok(f"Normalized medications: {norm['normalized']}")
        else:
            log_warn(f"Medication normalization skipped/failed: {norm}")

    return medications, sources


def severity_rank(severity: str) -> int:
    order = {"contraindicated": 0, "major": 1, "moderate": 2, "minor": 3}
    return order.get((severity or "").lower(), 99)


def run_check(summaries_dir: Path, output_path: Path) -> dict:
    load_environment()
    log_step(f"Loading summaries from {summaries_dir}")
    records = load_summaries(summaries_dir)
    log_ok(f"Loaded {len(records)} summary record(s)")
    medications, sources = extract_medications(records)

    if len(medications) < 1:
        log_warn("No medications found across document summaries")
        result = {
            "status": "no_medications_found",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "summaries_scanned": len(records),
            "medications": [],
            "sources": sources,
            "interactions": [],
            "count": 0,
            "has_major_or_contraindicated": False,
            "flags": [],
            "message": "No medications were found across document summaries.",
        }
    else:
        log_step(f"Running clinical-ddi-check on {len(medications)} medication(s)")
        ddi = drug_interaction_check(medications)
        if "error_code" in ddi:
            log_error(f"DDI check error [{ddi.get('error_code')}]: {ddi.get('message')}")
            result = {
                "status": "error",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "summaries_scanned": len(records),
                "medications": medications,
                "sources": sources,
                "interactions": [],
                "count": 0,
                "has_major_or_contraindicated": False,
                "flags": [],
                "error": ddi,
                "message": ddi.get("message", "Drug interaction check failed."),
            }
        else:
            interactions = sorted(
                ddi.get("interactions") or [],
                key=lambda x: severity_rank(x.get("severity", "")),
            )
            flags = [
                {
                    "severity": item.get("severity"),
                    "title": f"{item.get('drug_a', '').title()} × {item.get('drug_b', '').title()}",
                    "description": item.get("description"),
                    "clinical_advice": item.get("clinical_advice"),
                    "drug_a": item.get("drug_a"),
                    "drug_b": item.get("drug_b"),
                }
                for item in interactions
            ]
            if interactions:
                log_warn(f"Found {len(interactions)} interaction flag(s)")
                for flag in flags:
                    log_warn(f"  - [{flag['severity']}] {flag['title']}")
            else:
                log_ok("No drug-drug interactions flagged")
            result = {
                "status": "checked",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "summaries_scanned": len(records),
                "medications": ddi.get("medications_checked") or medications,
                "medications_raw": medications,
                "sources": sources,
                "interactions": interactions,
                "count": ddi.get("count", len(interactions)),
                "has_major_or_contraindicated": bool(ddi.get("has_major_or_contraindicated")),
                "flags": flags,
                "message": (
                    f"Found {len(interactions)} interaction(s) across {len(medications)} medication(s)."
                    if interactions
                    else f"No drug-drug interactions flagged across {len(medications)} medication(s)."
                ),
            }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    log_ok(f"DDI results saved -> {output_path}")
    return result


def main() -> int:
    summaries_dir = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_SUMMARIES_DIR
    output_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else DEFAULT_OUTPUT_PATH

    log_info("=" * 60)
    log_info("MediLink drug-interaction-check started")
    log_info(f"Summaries : {summaries_dir}")
    log_info(f"Output    : {output_path}")
    log_info("=" * 60)

    try:
        result = run_check(summaries_dir, output_path)
        log_info(f"Finished with status={result.get('status')} count={result.get('count', 0)}")
        print(
            json.dumps(
                {
                    "ok": True,
                    "output_path": str(output_path),
                    "status": result.get("status"),
                    "count": result.get("count", 0),
                    "medications": result.get("medications", []),
                }
            )
        )
        return 0
    except Exception as exc:
        log_error(f"Drug interaction check crashed: {exc}")
        print(json.dumps({"ok": False, "error": str(exc)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
