"use client";

import { useEffect, useRef, useState } from "react";
import { scanCardText, guessSearchQuery, stopScanner } from "@/lib/scanCard";

type Phase = "live" | "analyzing" | "result";

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
  const [phase, setPhase] = useState<Phase>("live");
  const [guess, setGuess] = useState("");
  const [error, setError] = useState(false);
  // debug temporário: mostra o recorte real e o texto bruto do OCR — remover quando o
  // reconhecimento em foto real estiver confiável (ver ARCHITECTURE.md)
  const [debugCrop, setDebugCrop] = useState<string | null>(null);
  const [debugRaw, setDebugRaw] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError(true));

    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
      stopScanner();
    };
  }, []);

  // captura de um toque só — sem loop tentando travar sozinho: no celular o OCR já leva
  // 1-3s por leitura, esperar duas leituras iguais seguidas virava 5-10s+ de espera incerta
  async function capture() {
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
    setDebugCrop(canvas.toDataURL("image/png"));

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    setPhase("analyzing");
    try {
      const text = await scanCardText(blob);
      setDebugRaw(text);
      setGuess(guessSearchQuery(text));
    } catch {
      setGuess("");
    }
    setPhase("result");
  }

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

      {debugCrop && (
        <div
          className="absolute left-4 flex max-w-[55vw] flex-col gap-1"
          style={{ top: "max(1rem, env(safe-area-inset-top))" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={debugCrop} alt="" className="h-24 w-auto rounded-lg border border-white/40" />
          <p className="max-h-16 overflow-y-auto whitespace-pre-wrap rounded-md bg-black/70 p-1.5 font-mono text-[10px] leading-tight text-white/80">
            {debugRaw || "…"}
          </p>
        </div>
      )}

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 to-transparent px-6 pt-16"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        {phase === "live" && (
          <>
            <p className="text-[13px] text-white/70">encaixe a carta no quadro e toque pra fotografar</p>
            <button
              onClick={capture}
              aria-label="fotografar"
              className="h-16 w-16 rounded-full border-4 border-white bg-white/20 transition-transform active:scale-90"
            />
          </>
        )}

        {phase === "analyzing" && (
          <div className="flex items-center gap-2 py-4 text-[15px] text-white">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            lendo a carta…
          </div>
        )}

        {phase === "result" && (
          <>
            <p className="text-[13px] text-white/70">{guess ? "reconheci:" : "não consegui ler essa foto"}</p>
            <p className="min-h-[1.5em] text-[17px] font-medium text-white">{guess || " "}</p>
            <div className="flex w-full max-w-xs gap-2">
              <button
                onClick={() => {
                  setPhase("live");
                  setGuess("");
                }}
                className="flex-1 rounded-2xl bg-white/15 py-3 text-[15px] font-medium text-white"
              >
                Tentar de novo
              </button>
              <button
                onClick={() => guess && onScanned(guess)}
                disabled={!guess}
                className="flex-1 rounded-2xl bg-accent py-3 text-[15px] font-medium text-accent-foreground transition-opacity disabled:opacity-30"
              >
                Usar esse
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
