"use client";

import { useEffect, useRef, useState } from "react";
import { scanCardText, guessSearchQuery, stopScanner } from "@/lib/scanCard";

const SCAN_INTERVAL_MS = 1500;
const STABLE_HITS_TO_CONFIRM = 2;

export function CameraLiveModal({
  onClose,
  onScanned,
  onFallback,
}: {
  onClose: () => void;
  onScanned: (guess: string) => void;
  /** câmera indisponível/negada — deixa o caller oferecer o fluxo de foto única */
  onFallback: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [guess, setGuess] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const stable = { guess: "", count: 0 };

    async function captureAndScan() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const frame = frameRef.current;
      if (!video || !canvas || !frame || video.videoWidth === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // recorta só a área do quadro-guia, não o frame inteiro — sem isso o OCR
      // via com fundo/mão/mesa junto da carta, que fica pequena demais pra ler
      const videoRect = video.getBoundingClientRect();
      const guideRect = frame.getBoundingClientRect();
      const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
      const offsetX = (video.videoWidth * scale - videoRect.width) / 2;
      const offsetY = (video.videoHeight * scale - videoRect.height) / 2;
      const srcX = (guideRect.left - videoRect.left + offsetX) / scale;
      const srcY = (guideRect.top - videoRect.top + offsetY) / scale;
      const srcW = guideRect.width / scale;
      const srcH = guideRect.height / scale;

      const UPSCALE = 2; // câmera ambiente costuma dar sensor de baixa resolução — amplia antes do OCR
      canvas.width = srcW * UPSCALE;
      canvas.height = srcH * UPSCALE;
      ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob || stopped) return;

      setAnalyzing(true);
      try {
        const text = await scanCardText(blob);
        if (stopped) return;
        const next = guessSearchQuery(text);
        setAnalyzing(false);
        if (!next) return;
        setGuess(next);

        const confident = next.includes(" "); // "Nome nº" — os dois pedaços batendo
        if (confident && next === stable.guess) {
          stable.count += 1;
          if (stable.count >= STABLE_HITS_TO_CONFIRM) {
            stopped = true;
            onScanned(next);
          }
        } else {
          stable.guess = next;
          stable.count = 1;
        }
      } catch {
        setAnalyzing(false);
      }
    }

    async function loop() {
      if (stopped) return;
      await captureAndScan();
      if (!stopped) timer = setTimeout(loop, SCAN_INTERVAL_MS);
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        loop();
      })
      .catch(() => setError(true));

    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <p className="text-[15px] text-foreground">Não deu pra acessar a câmera.</p>
        <p className="text-[13px] text-muted">Confirma a permissão do navegador, ou tira uma foto em vez disso.</p>
        <div className="flex gap-2">
          <button
            onClick={onFallback}
            className="rounded-xl bg-accent px-4 py-2.5 text-[14px] font-medium text-accent-foreground"
          >
            Tirar foto
          </button>
          <button onClick={onClose} className="rounded-xl bg-surface-strong px-4 py-2.5 text-[14px] text-foreground">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full flex-1 object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ paddingBottom: "18vh" }}
      >
        <div
          ref={frameRef}
          className="aspect-[5/7] w-[70vw] max-w-xs rounded-2xl border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
        />
      </div>

      <button
        onClick={onClose}
        aria-label="fechar"
        className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        ✕
      </button>

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 to-transparent px-6 pt-16"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <p className="text-[13px] text-white/70">{analyzing ? "analisando…" : "aponte pra carta"}</p>
        <p className="min-h-[1.5em] text-[17px] font-medium text-white">{guess || " "}</p>
        <button
          onClick={() => guess && onScanned(guess)}
          disabled={!guess}
          className="w-full max-w-xs rounded-2xl bg-accent py-3 text-[15px] font-medium text-accent-foreground transition-opacity disabled:opacity-30"
        >
          Usar esse
        </button>
      </div>
    </div>
  );
}
