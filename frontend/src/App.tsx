import { useState } from "react";
import { Loader2, AlertCircle, Mic2 } from "lucide-react";
import { API_URL } from "./config";
import Recorder from "./components/Recorder";
import FileUpload from "./components/FileUpload";
import TranscriptViewer from "./components/TranscriptViewer";
import type { Transcript } from "./types";

type Tab = "record" | "upload";
type ModelSize = "tiny" | "base" | "small" | "medium" | "large-v3";

async function transcribeBlob(
  blob: Blob,
  filename: string,
  modelSize: ModelSize,
  language: string
): Promise<Transcript> {
  const form = new FormData();
  form.append("file", blob, filename);
  form.append("model_size", modelSize);
  form.append("language", language);
  const res = await fetch(`${API_URL}/api/transcribe`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Transcription failed");
  }
  return res.json();
}

export default function App() {
  const [tab, setTab] = useState<Tab>("record");
  const [modelSize, setModelSize] = useState<ModelSize>("base");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  const handleAudio = async (blob: Blob, filename = "recording.webm") => {
    setLoading(true);
    setError(null);
    try {
      const result = await transcribeBlob(blob, filename, modelSize, language);
      setTranscript(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Mic2 className="w-6 h-6 text-brand" />
          <span className="font-bold text-lg tracking-tight">TesterFlow</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
            Hindi · English
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* settings row */}
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-600">
            Whisper model
            <select
              value={modelSize}
              onChange={(e) => setModelSize(e.target.value as ModelSize)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="tiny">Tiny (fastest, lower accuracy)</option>
              <option value="base">Base (recommended)</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large-v3">Large v3 (most accurate)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-600">
            Language hint (optional)
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="">Auto-detect</option>
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        {/* input card */}
        <div className="card flex flex-col gap-6">
          {/* tabs */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 self-start">
            {(["record", "upload"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-sm font-medium transition-colors capitalize
                  ${tab === t ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "record" ? (
            <Recorder
              onBlob={(blob) => handleAudio(blob, "recording.webm")}
              disabled={loading}
            />
          ) : (
            <FileUpload
              onFile={(file) => handleAudio(file, file.name)}
              disabled={loading}
            />
          )}
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span className="text-sm">Transcribing with Whisper {modelSize}…</span>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Transcription error</p>
              <p className="text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* result */}
        {transcript && !loading && <TranscriptViewer transcript={transcript} />}

        {/* empty state */}
        {!transcript && !loading && !error && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Record audio or upload a file to get a bilingual transcript.
          </div>
        )}
      </main>
    </div>
  );
}
