import whisper
import torch
import tempfile
import os
from pathlib import Path

_model_cache: dict = {}

def get_model(model_size: str = "large-v3") -> whisper.Whisper:
    if model_size not in _model_cache:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _model_cache[model_size] = whisper.load_model(model_size, device=device)
    return _model_cache[model_size]


def transcribe_file(
    audio_path: str,
    language: str | None = None,
    model_size: str = "large-v3",
    task: str = "transcribe",
) -> dict:
    model = get_model(model_size)
    options = {
        "task": task,
        "verbose": False,
        "word_timestamps": True,
    }
    if language:
        options["language"] = language

    result = model.transcribe(audio_path, **options)

    segments = []
    for seg in result.get("segments", []):
        words = []
        for w in seg.get("words", []):
            words.append({
                "word": w["word"],
                "start": round(w["start"], 2),
                "end": round(w["end"], 2),
                "script": _detect_script(w["word"]),
            })
        segments.append({
            "id": seg["id"],
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
            "words": words,
        })

    return {
        "text": result["text"].strip(),
        "language": result.get("language", "unknown"),
        "segments": segments,
        "duration": segments[-1]["end"] if segments else 0,
    }


def _detect_script(word: str) -> str:
    word = word.strip()
    devanagari = sum(1 for c in word if "ऀ" <= c <= "ॿ")
    latin = sum(1 for c in word if c.isascii() and c.isalpha())
    if devanagari > latin:
        return "devanagari"
    elif latin > 0:
        return "latin"
    return "other"
