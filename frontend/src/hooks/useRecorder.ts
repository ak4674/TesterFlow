import { useRef, useState, useCallback } from "react";

export type RecorderState = "idle" | "recording" | "processing";

export function useRecorder(onBlob: (blob: Blob) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    setMicError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Allow mic access in your browser and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
          ? "No microphone found. Plug in a mic or use the Upload tab."
          : `Microphone error: ${(err as Error).message}`;
      setMicError(msg);
      return;
    }
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((t) => t.stop());
      onBlob(blob);
    };
    mr.start(200);
    mediaRef.current = mr;
    setSeconds(0);
    setState("recording");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [onBlob]);

  const stop = useCallback(() => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState("processing");
  }, []);

  return { state, seconds, micError, start, stop };
}
