#!/usr/bin/env python3
"""
Document processing pipeline:
  PDF text (PyMuPDF) -> LangChain -> Gemini 2.5 Flash (structured JSON)
  -> Gemini 2.5 Flash (concise medical summary) -> local JSON storage
"""
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import fitz
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).resolve().parent.parent
GEMINI_MODEL = "gemini-2.5-flash"


def log(level: str, message: str) -> None:
    """Human-readable terminal progress / error logs (stderr)."""
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


class ExtractedMedicalRecord(BaseModel):
    """Structured fields extracted from raw document text."""

    report_title: str = Field(description="Short title for the report, e.g. 'Annual Health Checkup'")
    provider: str = Field(description="Physician or facility name; use 'Not clearly stated' if missing")
    department: str = Field(description="Medical department or specialty")
    report_type: str = Field(description="Type of visit or report, e.g. Follow-up, Lab panel, Annual checkup")
    report_date: str = Field(description="Date of visit or report in readable form")
    chief_complaint: str = Field(description="Primary reason for visit or main concern")
    key_findings: list[str] = Field(description="Bullet-style clinical findings, vitals, or lab highlights")
    assessment: str = Field(description="Clinical assessment or impression")
    plan: str = Field(description="Treatment plan or recommendations")
    orders: str = Field(description="Tests, imaging, or follow-up orders; empty string if none")


def load_environment() -> None:
    load_dotenv(ROOT_DIR / ".env")


def _clean_env_value(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip().strip('"').strip("'").strip()
    return cleaned or None


def get_api_key() -> str:
    """Return the configured Gemini API key."""
    key = _clean_env_value(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY (or GOOGLE_API_KEY) is not set. Add it to your .env file."
        )
    return key


def create_llm(api_key: str | None = None) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=api_key or get_api_key(),
        temperature=0.1,
    )


def is_quota_error(exc: Exception) -> bool:
    lower = str(exc).lower()
    return (
        "resource_exhausted" in lower
        or "quota exceeded" in lower
        or "rate limit" in lower
        or "429" in lower
        or "too many requests" in lower
    )


def clean_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf_text(file_path: Path) -> tuple[str, int]:
    doc = fitz.open(file_path)
    pages = [page.get_text("text") for page in doc]
    page_count = len(doc)
    doc.close()
    return clean_text("\n".join(pages)), page_count


def truncate_for_llm(text: str, max_chars: int = 12000) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n\n[Document truncated for processing.]"


def extract_structured_json(llm: ChatGoogleGenerativeAI, document_text: str, file_name: str) -> ExtractedMedicalRecord:
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a clinical document extraction assistant. "
                "Read the raw text from a medical document and return structured JSON only. "
                "Use only information present in the text. If a field is missing, use a sensible default "
                "such as 'Not clearly stated' or an empty list/string. Do not invent clinical facts.",
            ),
            (
                "human",
                "File name: {file_name}\n\nDocument text:\n{document_text}",
            ),
        ]
    )
    chain = prompt | llm.with_structured_output(ExtractedMedicalRecord)
    return chain.invoke({"file_name": file_name, "document_text": document_text})


def generate_medical_summary(
    llm: ChatGoogleGenerativeAI,
    structured: ExtractedMedicalRecord,
    file_name: str,
) -> str:
    findings_block = "\n".join(f"- {item}" for item in structured.key_findings) or "- No key findings listed"

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a medical summarization assistant. "
                "Given structured clinical data, write a concise plain-text summary for a patient dashboard. "
                "Use exactly this structure and section labels:\n\n"
                "{report_title}\n"
                "─────────────────────\n"
                "Provider: ...\n"
                "Department: ...\n"
                "Type: ...\n"
                "Date: ...\n\n"
                "Chief Complaint: ...\n\n"
                "Key Findings:\n"
                "- ...\n\n"
                "Assessment: ...\n\n"
                "Plan: ...\n\n"
                "Order: ...\n\n"
                "Keep it factual, concise, and professional. Do not add markdown or JSON.",
            ),
            (
                "human",
                "File name: {file_name}\n\nStructured data (JSON):\n{structured_json}",
            ),
        ]
    )
    chain = prompt | llm
    response = chain.invoke(
        {
            "report_title": structured.report_title,
            "file_name": file_name,
            "structured_json": structured.model_dump_json(indent=2),
        }
    )
    return response.content.strip()


def classify_processing_error(exc: Exception) -> dict:
    """Map raw exceptions to user-facing, structured failure details."""
    raw = str(exc)
    lower = raw.lower()

    if (
        "resource_exhausted" in lower
        or "quota exceeded" in lower
        or "rate limit" in lower
        or "429" in lower
        or "too many requests" in lower
    ):
        return {
            "reason_code": "api_quota_exceeded",
            "status_label": "AI summary unavailable — API limit reached",
            "provider": "MediLink AI",
            "department": "Document Processing",
            "report_type": "Pending AI summary",
            "chief_complaint": "Automatic clinical summary could not be completed",
            "key_findings": [
                "The Gemini API quota or rate limit was exceeded while processing this document.",
                "The original PDF was saved successfully in your Documents folder.",
                "No clinical findings were extracted for this report yet.",
            ],
            "assessment": (
                "Summary generation is temporarily unavailable because the AI service "
                "daily/minute request limit was reached for the configured Gemini API key."
            ),
            "plan": (
                "Please try again later once the API quota resets. "
                "You can still open the original document from the Documents tab."
            ),
            "orders": "Retry AI summarization after waiting a few minutes.",
            "user_message": (
                "AI summary temporarily unavailable due to API quota / rate limit. "
                "Your document is saved — please retry later."
            ),
        }

    if "gemini_api_key" in lower or "google_api_key" in lower or "api key" in lower:
        return {
            "reason_code": "missing_api_key",
            "status_label": "AI summary unavailable — API key missing",
            "provider": "MediLink AI",
            "department": "Document Processing",
            "report_type": "Pending AI summary",
            "chief_complaint": "Automatic clinical summary could not be completed",
            "key_findings": [
                "No valid GEMINI_API_KEY was found in the environment.",
                "The original file was stored locally.",
            ],
            "assessment": "Document processing is configured, but the Gemini API key is missing or invalid.",
            "plan": "Add GEMINI_API_KEY to your .env file, restart the server, then re-upload or re-process.",
            "orders": "Configure GEMINI_API_KEY and retry.",
            "user_message": "AI summary unavailable because the Gemini API key is missing.",
        }

    if "no readable text" in lower or "empty" in lower:
        return {
            "reason_code": "empty_pdf_text",
            "status_label": "AI summary unavailable — no readable text",
            "provider": "MediLink AI",
            "department": "Document Processing",
            "report_type": "Pending AI summary",
            "chief_complaint": "Automatic clinical summary could not be completed",
            "key_findings": [
                "PyMuPDF could not extract usable text from this PDF.",
                "The file may be a scanned image PDF without OCR text.",
            ],
            "assessment": "Text extraction failed, so AI summarization could not run.",
            "plan": "Upload a text-based PDF, or provide an OCR-processed version of this document.",
            "orders": "Re-upload a readable PDF version.",
            "user_message": "AI summary unavailable because no readable text was found in the PDF.",
        }

    if "timeout" in lower or "timed out" in lower:
        return {
            "reason_code": "processing_timeout",
            "status_label": "AI summary unavailable — processing timed out",
            "provider": "MediLink AI",
            "department": "Document Processing",
            "report_type": "Pending AI summary",
            "chief_complaint": "Automatic clinical summary could not be completed",
            "key_findings": [
                "The AI processing request took too long and was stopped.",
                "The original document remains saved in your records.",
            ],
            "assessment": "Processing timed out before a complete summary could be generated.",
            "plan": "Retry summarization. If this continues, try a smaller or clearer PDF.",
            "orders": "Retry AI summarization.",
            "user_message": "AI summary unavailable because processing timed out. Please retry.",
        }

    return {
        "reason_code": "processing_failed",
        "status_label": "AI summary unavailable — processing failed",
        "provider": "MediLink AI",
        "department": "Document Processing",
        "report_type": "Pending AI summary",
        "chief_complaint": "Automatic clinical summary could not be completed",
        "key_findings": [
            "An unexpected error occurred while generating the AI summary.",
            "The original document was saved successfully.",
        ],
        "assessment": "The document processor could not finish summarization for this upload.",
        "plan": "Please retry later. If the issue continues, verify the file is a valid PDF and the AI service is available.",
        "orders": "Retry AI summarization.",
        "user_message": "AI summary could not be generated for this document. Please retry later.",
    }


def build_structured_failure_summary(
    *,
    file_name: str,
    report_title: str,
    report_date: str,
    details: dict,
) -> str:
    findings = "\n".join(f"- {item}" for item in details["key_findings"])
    return (
        f"{report_title}\n"
        "─────────────────────\n"
        f"Provider: {details['provider']}\n"
        f"Department: {details['department']}\n"
        f"Type: {details['report_type']}\n"
        f"Date: {report_date}\n"
        f"Document: {file_name}\n"
        f"Status: {details['status_label']}\n\n"
        f"Chief Complaint: {details['chief_complaint']}\n\n"
        "Key Findings:\n"
        f"{findings}\n\n"
        f"Assessment: {details['assessment']}\n\n"
        f"Plan: {details['plan']}\n\n"
        f"Order: {details['orders']}\n\n"
        "Note: This is a system status summary. Clinical content will appear here once AI processing succeeds."
    )


def build_failure_result(file_path: Path, exc: Exception, page_count: int = 0, character_count: int = 0) -> dict:
    title = file_path.stem.replace("_", " ").replace("-", " ").title()
    report_date = datetime.fromtimestamp(file_path.stat().st_mtime).strftime("%b %d, %Y")
    details = classify_processing_error(exc)
    summary_text = build_structured_failure_summary(
        file_name=file_path.name,
        report_title=title,
        report_date=report_date,
        details=details,
    )
    return {
        "status": "processing_failed",
        "file_name": file_path.name,
        "report_title": title,
        "summary_text": summary_text,
        "structured_data": {
            "report_title": title,
            "provider": details["provider"],
            "department": details["department"],
            "report_type": details["report_type"],
            "report_date": report_date,
            "chief_complaint": details["chief_complaint"],
            "key_findings": details["key_findings"],
            "assessment": details["assessment"],
            "plan": details["plan"],
            "orders": details["orders"],
        },
        "metadata": {
            "provider": details["provider"],
            "department": details["department"],
            "report_type": details["report_type"],
            "report_date": report_date,
            "page_count": page_count,
            "character_count": character_count,
            "model": GEMINI_MODEL,
            "pipeline": "failed",
            "failure_reason": details["reason_code"],
            "user_message": details["user_message"],
        },
        "error": str(exc),
        "error_code": details["reason_code"],
        "user_message": details["user_message"],
    }


def summarize_pdf(file_path: Path) -> dict:
    log_step(f"Extracting text from PDF with PyMuPDF: {file_path.name}")
    full_text, page_count = extract_pdf_text(file_path)
    if not full_text:
        raise ValueError("No readable text was extracted from the PDF.")
    log_ok(f"Extracted {len(full_text)} characters from {page_count} page(s)")

    load_environment()
    api_key = get_api_key()
    log_info(f"Using Gemini API key with model {GEMINI_MODEL}")
    document_text = truncate_for_llm(full_text)
    if len(full_text) > len(document_text):
        log_warn("Document text truncated before sending to Gemini")

    llm = create_llm(api_key)
    try:
        log_step("Calling LangChain -> Gemini for structured JSON extraction")
        structured = extract_structured_json(llm, document_text, file_path.name)
        log_ok(f"Structured extraction complete: {structured.report_title}")

        log_step("Calling LangChain -> Gemini for concise medical summary")
        summary_text = generate_medical_summary(llm, structured, file_path.name)
        log_ok(f"Medical summary generated ({len(summary_text)} characters)")
        return {
            "status": "processed",
            "file_name": file_path.name,
            "report_title": structured.report_title,
            "summary_text": summary_text,
            "structured_data": structured.model_dump(),
            "metadata": {
                "provider": structured.provider,
                "department": structured.department,
                "report_type": structured.report_type,
                "report_date": structured.report_date,
                "page_count": page_count,
                "character_count": len(full_text),
                "model": GEMINI_MODEL,
                "pipeline": "pymupdf -> langchain -> structured_json -> medical_summary",
            },
        }
    except Exception as exc:
        if is_quota_error(exc):
            log_error(f"Gemini quota/rate limit reached: {exc}")
        else:
            log_error(f"Gemini processing failed: {exc}")
        raise


def summarize_non_pdf(file_path: Path) -> dict:
    log_step(f"Non-PDF upload detected ({file_path.suffix or 'no extension'}) — skipping AI summarization")
    title = file_path.stem.replace("_", " ").replace("-", " ").title()
    report_date = datetime.fromtimestamp(file_path.stat().st_mtime).strftime("%b %d, %Y")
    details = {
        "reason_code": "non_pdf_upload",
        "status_label": "Stored without AI PDF extraction",
        "provider": "MediLink AI",
        "department": "Uploaded records",
        "report_type": f"{file_path.suffix.replace('.', '').upper() or 'FILE'} upload",
        "chief_complaint": "Non-PDF file uploaded",
        "key_findings": [
            "This upload is not a PDF, so text extraction was skipped.",
            "The document is stored locally and available from the Documents tab.",
        ],
        "assessment": "File saved successfully. AI clinical summarization runs for PDF uploads only.",
        "plan": "Upload a PDF version of this document to enable automatic summary generation.",
        "orders": "Optional: re-upload as PDF.",
        "user_message": "Non-PDF upload stored successfully without AI summarization.",
    }
    summary_text = build_structured_failure_summary(
        file_name=file_path.name,
        report_title=title,
        report_date=report_date,
        details=details,
    )
    log_ok("Stored local non-PDF status summary")
    return {
        "status": "stored_without_pdf_extraction",
        "file_name": file_path.name,
        "report_title": title,
        "summary_text": summary_text,
        "structured_data": {
            "report_title": title,
            "provider": details["provider"],
            "department": details["department"],
            "report_type": details["report_type"],
            "report_date": report_date,
            "chief_complaint": details["chief_complaint"],
            "key_findings": details["key_findings"],
            "assessment": details["assessment"],
            "plan": details["plan"],
            "orders": details["orders"],
        },
        "metadata": {
            "provider": details["provider"],
            "department": details["department"],
            "report_type": details["report_type"],
            "report_date": report_date,
            "page_count": 0,
            "character_count": 0,
            "model": None,
            "pipeline": "file_storage_only",
            "failure_reason": details["reason_code"],
            "user_message": details["user_message"],
        },
        "user_message": details["user_message"],
    }


def main() -> int:
    if len(sys.argv) != 3:
        log_error("Usage: process_document.py <document_path> <summaries_dir>")
        return 1

    document_path = Path(sys.argv[1]).resolve()
    summaries_dir = Path(sys.argv[2]).resolve()
    summaries_dir.mkdir(parents=True, exist_ok=True)

    log_info("=" * 60)
    log_info("MediLink document processor started")
    log_info(f"Document : {document_path}")
    log_info(f"Output   : {summaries_dir}")
    log_info("=" * 60)

    if not document_path.exists():
        log_error(f"Document not found: {document_path}")
        return 1

    page_count = 0
    character_count = 0
    try:
        if document_path.suffix.lower() == ".pdf":
            try:
                text, page_count = extract_pdf_text(document_path)
                character_count = len(text)
            except Exception as preview_exc:
                log_warn(f"Could not pre-read PDF for metadata: {preview_exc}")
                page_count = 0
                character_count = 0
            result = summarize_pdf(document_path)
        else:
            result = summarize_non_pdf(document_path)
    except Exception as exc:
        details = classify_processing_error(exc)
        log_error(f"Processing failed [{details['reason_code']}]: {details['user_message']}")
        log_error(f"Raw error: {exc}")
        result = build_failure_result(
            document_path,
            exc,
            page_count=page_count,
            character_count=character_count,
        )
        log_warn("Writing structured failure summary for the dashboard View Report popup")

    result["generated_at"] = datetime.utcnow().isoformat() + "Z"
    result["source_path"] = str(document_path)

    output_path = summaries_dir / f"{document_path.name}.json"
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

    if result["status"] == "processed":
        log_ok(f"Summary saved successfully -> {output_path.name}")
        log_ok(f"Report title: {result.get('report_title')}")
    elif result["status"] == "processing_failed":
        log_warn(f"Failure summary saved -> {output_path.name}")
        log_warn(f"Reason: {result.get('error_code') or result.get('user_message')}")
    else:
        log_info(f"Result saved [{result['status']}] -> {output_path.name}")

    log_info("Document processor finished")
    print(
        json.dumps(
            {
                "ok": True,
                "summary_path": str(output_path),
                "status": result["status"],
                "user_message": result.get("user_message"),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
