import { useState } from "react";
import { Download, Search, Copy, Check } from "lucide-react";
import { API_URL } from "../config";
import type { Transcript, WordToken } from "../types";

interface Props {
  transcript: Transcript;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function WordSpan({ w }: { w: WordToken }) {
  return (
    <span
      className={w.script === "devanagari" ? "word-hindi" : "word-english"}
      title={`${fmtTime(w.start)} – ${fmtTime(w.end)}`}
    >
      {w.word}
    </span>
  );
}

const LANG_LABELS: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  unknown: "Unknown",
};

export default function TranscriptViewer({ transcript }: Props) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showWords, setShowWords] = useState(true);

  const langLabel = LANG_LABELS[transcript.language] ?? transcript.language.toUpperCase();
  const hindiCount = transcript.segments
    .flatMap((s) => s.words)
    .filter((w) => w.script === "devanagari").length;
  const totalWords = transcript.segments.flatMap((s) => s.words).length;
  const hindiPct = totalWords ? Math.round((hindiCount / totalWords) * 100) : 0;

  const filteredSegments = query
    ? transcript.segments.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase())
      )
    : transcript.segments;

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (fmt: "txt" | "json" | "docx") => {
    const res = await fetch(`${API_URL}/api/export?format=${fmt}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transcript),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card flex flex-col gap-5">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
            {langLabel} detected
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {hindiPct}% Hindi · {100 - hindiPct}% English
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            {fmtTime(transcript.duration)} · {totalWords} words
          </span>
        </div>

        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-ghost text-xs">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={() => handleExport("txt")} className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" /> TXT
          </button>
          <button onClick={() => handleExport("docx")} className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" /> DOCX
          </button>
          <button onClick={() => handleExport("json")} className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showWords}
            onChange={(e) => setShowWords(e.target.checked)}
            className="accent-violet-600"
          />
          Highlight scripts
        </label>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-700 inline-block" />
          Hindi (Devanagari)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gray-900 inline-block" />
          English (Latin)
        </span>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transcript…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      {/* segments */}
      <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredSegments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No segments match your search.</p>
        )}
        {filteredSegments.map((seg) => (
          <div key={seg.id} className="flex gap-3 group">
            <span className="mt-0.5 text-xs text-gray-400 font-mono whitespace-nowrap shrink-0 pt-1">
              {fmtTime(seg.start)}
            </span>
            <p className="text-sm leading-relaxed flex-1 flex flex-wrap gap-x-0.5 gap-y-0.5">
              {showWords
                ? seg.words.map((w, i) => <WordSpan key={i} w={w} />)
                : seg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
