import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { useRecorder } from "../hooks/useRecorder";

interface Props {
  onBlob: (blob: Blob) => void;
  disabled?: boolean;
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function Recorder({ onBlob, disabled }: Props) {
  const { state, seconds, micError, start, stop } = useRecorder(onBlob);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {state === "recording" && (
          <span className="recording-ring absolute inset-0 rounded-full" />
        )}
        <button
          onClick={state === "idle" ? start : stop}
          disabled={disabled || state === "processing"}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all active:scale-95
            ${state === "recording" ? "bg-red-500 hover:bg-red-600" : "bg-brand hover:bg-violet-700"}
            ${disabled || state === "processing" ? "opacity-50 cursor-not-allowed" : ""}
          `}
          aria-label={state === "recording" ? "Stop recording" : "Start recording"}
        >
          {state === "processing" ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : state === "recording" ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {state === "recording" && (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording — {fmt(seconds)}
          </span>
        )}
        {state === "processing" && "Processing…"}
        {state === "idle" && !micError && "Click to record"}
      </p>

      {micError && (
        <div className="flex items-start gap-2 mt-1 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs max-w-xs text-center">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
}
