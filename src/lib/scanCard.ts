import type { Worker } from "tesseract.js";

/**
 * Worker do tesseract é caro de criar (baixa e inicializa o modelo de
 * idioma) — reusa a mesma instância entre chamadas em vez de recriar a
 * cada frame, essencial pro modo de câmera ao vivo (uma leitura a cada
 * ~1.5s). Import dinâmico: tesseract.js (~2-3MB de WASM) só entra no
 * bundle quando alguém realmente usa o scanner.
 */
let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then((mod) => mod.default.createWorker("eng"));
  }
  return workerPromise;
}

export async function scanCardText(image: File | Blob): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  return data.text;
}

/** libera o worker (câmera ao vivo termina a sessão de scan) — sem isso ele fica ocupando memória à toa */
export async function stopScanner(): Promise<void> {
  if (!workerPromise) return;
  const worker = await workerPromise;
  workerPromise = null;
  await worker.terminate();
}

/**
 * Heurística pra virar o texto bruto do OCR numa busca "Nome nº": pega o
 * primeiro número no formato impresso na carta (ex "58/102") e a primeira
 * linha que parece um nome (só letras, sem dígito). Nunca é perfeito — o
 * resultado pré-preenche a busca, e a pessoa pode corrigir antes de buscar.
 */
export function guessSearchQuery(rawText: string): string {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const numberMatch = rawText.match(/\b(\d{1,3})\s*\/\s*\d{1,3}\b/);
  const number = numberMatch?.[1];

  // ignora rótulos comuns acima do nome ("Basic Pokémon", "Stage 2") — não são o nome da carta
  const boilerplate = /^(basic|stage ?1|stage ?2|mega|vmax|vstar|break|restored|level-?up)$/i;
  const nameLine = lines.find(
    (l) => /^[A-Za-zÀ-ÿ'. ]{3,}$/.test(l) && !/pok[eé]mon/i.test(l) && !boilerplate.test(l)
  );

  if (nameLine && number) return `${nameLine} ${number}`;
  return nameLine ?? number ?? lines[0] ?? "";
}
