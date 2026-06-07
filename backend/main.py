from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import transcribe, ws_transcribe

app = FastAPI(title="WisperFlow Hindi-English STT", version="1.0.0")

import os as _os

_origins = [o.strip() for o in _os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router)
app.include_router(ws_transcribe.router)


if __name__ == "__main__":
    import os, uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
