"use client";

import { useRef, useState } from "react";
import { scanCardText, guessSearchQuery } from "@/lib/scanCard";

export function CameraScanButton({ onScanned }: { onScanned: (guess: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escanear a mesma foto de novo depois
    if (!file) return;
    setLoading(true);
    try {
      const text = await scanCardText(file);
      onScanned(guessSearchQuery(text));
    } catch {
      // OCR falhou (foto ruim, modelo não carregou etc.) — sem drama, a pessoa digita na mão
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        aria-label="Escanear carta pela câmera"
        title="Escanear carta pela câmera"
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-muted transition-colors duration-200 hover:text-foreground active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-muted/40 border-t-accent" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M4 8a2 2 0 0 1 2-2h1.4l1-1.6a1 1 0 0 1 .86-.4h5.48a1 1 0 0 1 .86.4l1 1.6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12.8" r="3.1" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </>
  );
}
