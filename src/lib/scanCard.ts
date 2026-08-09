/** roda só quando chamado — tesseract.js (~2-3MB de WASM) nunca entra no bundle principal */
export async function scanCardText(file: File): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(file, "eng");
  return data.text;
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
