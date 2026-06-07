import asyncio
import json
import os
import tempfile
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.transcriber import transcribe_file

router = APIRouter()

CHUNK_BYTES = 1024 * 32  # 32 KB chunks


@router.websocket("/ws/transcribe")
async def ws_transcribe(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()

    try:
        while True:
            data = await websocket.receive_bytes()
            audio_buffer.extend(data)

            # signal end: client sends empty bytes
            if len(data) == 0:
                break

        if not audio_buffer:
            await websocket.send_json({"error": "No audio received"})
            return

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_buffer)
            tmp_path = tmp.name

        try:
            result = await asyncio.to_thread(
                transcribe_file, tmp_path, None, "base"
            )
            await websocket.send_json({"type": "final", "result": result})
        finally:
            os.unlink(tmp_path)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
