import { SearchBox } from "@/components/SearchBox";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground text-balance">
          Busque qualquer carta
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Veja detalhes, preço de mercado e registre na sua coleção ou num deck.
        </p>
      </div>
      <SearchBox />
    </div>
  );
}
