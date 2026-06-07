import os
import tempfile
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from services.transcriber import transcribe_file
from services.exporter import export_txt, export_json, export_docx

router = APIRouter(prefix="/api", tags=["transcribe"])

ALLOWED_AUDIO = {".wav", ".mp3", ".m4a", ".ogg", ".flac", ".webm", ".mp4"}
EXPORT_FNS = {"txt": export_txt, "json": export_json, "docx": export_docx}


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default=""),
    model_size: str = Form(default="base"),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_AUDIO:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        lang = language.strip() or None
        result = await asyncio.to_thread(
            transcribe_file, tmp_path, lang, model_size
        )
    finally:
        os.unlink(tmp_path)

    return result


@router.post("/export")
async def export(
    transcript: dict,
    format: str = "txt",
):
    if format not in EXPORT_FNS:
        raise HTTPException(400, f"Unsupported format: {format}")

    with tempfile.NamedTemporaryFile(
        suffix=f".{format}", delete=False, mode="w" if format != "docx" else "w+b"
    ) as tmp:
        out_path = tmp.name

    EXPORT_FNS[format](transcript, out_path)

    media_map = {
        "txt": "text/plain",
        "json": "application/json",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return FileResponse(
        out_path,
        media_type=media_map[format],
        filename=f"transcript.{format}",
        background=None,
    )


@router.get("/health")
def health():
    return {"status": "ok"}
