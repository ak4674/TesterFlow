import { useRef } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT = ".wav,.mp3,.m4a,.ogg,.flac,.webm,.mp4";

export default function FileUpload({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
        ${disabled ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-300 hover:border-brand hover:bg-brand-light/30"}`}
    >
      <UploadCloud className="w-10 h-10 text-gray-400" />
      <p className="text-sm text-gray-600 text-center">
        <span className="font-semibold text-brand">Click to upload</span> or drag & drop
        <br />
        <span className="text-xs text-gray-400">WAV · MP3 · M4A · OGG · FLAC · WebM</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
