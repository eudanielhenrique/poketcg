# Arquitetura

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript** — SSR pra páginas de conteúdo (busca, detalhe de carta) e client components só onde há estado local (coleções, decks, formulários).
- **Tailwind CSS v4** — tokens de design (`src/app/globals.css`) em vez da paleta cinza padrão, pra fugir de cara de template.
- **[TCGdex](https://tcgdex.dev)** (`api.tcgdex.net/v2`) via `fetch` direto, sem SDK — o SDK oficial `@tcgdex/sdk` foi avaliado e removido: seus tipos TypeScript não batem com o formato real da API (o SDK não declara `variants_detailed`/`pricing`, que é onde o preço de mercado realmente vive). Um wrapper fino em `src/lib/tcgdex.ts` com tipos escritos a partir da resposta real da API é mais simples e mais correto.
- **Idioma da API: `en`**, fixo — `pt-br` existe mas cobre ~1.100 das 23.000+ cartas (confirmado em 2026-08-09 via `/v2/pt-br/cards` vs `/v2/en/cards`), insuficiente pra busca geral.
- **Sem banco de dados.** Coleções e decks moram no `localStorage` do navegador (`src/lib/storage.ts`), sincronizados via `useSyncExternalStore` — decisão do fundador: ferramenta pessoal, sem necessidade de login nem sincronizar entre dispositivos.
- **Sem novas dependências além do Next/Tailwind.** Motion de UI (hover, press, entrada de card) é só CSS (`transform`/`opacity` + `cubic-bezier`), suficiente pra essa superfície de interação (sem drag/gestos que justificassem uma lib de spring física).

## Estrutura de pastas

```
src/
  app/
    page.tsx                 busca de cartas (home)
    card/[id]/page.tsx       detalhe de uma carta (preço, ataques, ações)
    collection/page.tsx      lista de coleções do usuário
    collection/[id]/page.tsx cartas registradas numa coleção
    decks/page.tsx           lista de decks
    decks/[id]/page.tsx      cartas do deck + análise (categoria/tipo/HP/recuo/preço)
    layout.tsx, globals.css  shell + design tokens
  components/                Nav, SearchBox, CardThumb, CardActions, QuantityControl, DistBars
  lib/
    tcgdex.ts                cliente da API TCGdex + helpers de imagem/preço
    actions.ts                Server Actions que expõem tcgdex.ts pra client components
    storage.ts                estado local (coleções/decks) sincronizado com localStorage
    deckAnalysis.ts           lógica pura de análise de deck (com self-check em deckAnalysis.test.ts)
```

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run test     # self-check da lógica de análise de deck
npm run lint
```

Sem `.env` — a API do TCGdex é pública, sem chave.

## Serviços e integrações externas

- **TCGdex** (`api.tcgdex.net`, `assets.tcgdex.net`) — única integração externa. Preço vem de `cardmarket` (EUR) e `tcgplayer` (USD) embutidos na própria resposta da carta; `bestPrice()` prioriza TCGPlayer por ser a fonte mais líquida pro mercado americano, cai pro trend do Cardmarket quando não há.
- Sem deploy configurado ainda — projeto roda local. Alvo natural é Vercel (Next.js nativo), mas isso é decisão de quando o fundador quiser publicar.

## Decisões arquiteturais não óbvias

- **Coleções vêm pré-criadas por geração de Pokédex** (Kanto, Johto, ... Paldea), vazias — não é uma lista fechada de cartas, é só um agrupamento sugerido. O usuário registra ali qualquer carta/impressão que tiver do Pokémon correspondente. Semeadas uma única vez por navegador (flag `poketcg:collections:seeded` no localStorage), pra não reaparecerem se o usuário apagar todas de propósito.
- **`useLocalState` usa `useSyncExternalStore`, não `useState` + `useEffect`.** A primeira versão lia o localStorage num `useEffect` com `setState` — funciona, mas o ESLint (`react-hooks/set-state-in-effect`) sinaliza esse padrão como gerador de re-renders em cascata. `useSyncExternalStore` é a API que o próprio React recomenda pra sincronizar com uma fonte externa mutável (exatamente o caso do localStorage), e resolve o mismatch de hidratação (servidor não tem `window`) sem efeito manual.
- **`Deck` e coleção nomeada compartilham o mesmo shape** (`{ id, name, cards: Record<cardId, qty> }`, tipo genérico `CardGroup`) — mesma estrutura de dados e mesma UI de lista/detalhe pros dois conceitos, só trocando a chave de storage.
- **Preço e detalhes completos exigem uma chamada por carta** (`getCard`), porque a listagem de busca da API só devolve `id`/`name`/`image`. Coleção e deck buscam os detalhes de todas as cartas de uma vez (`getCardsDetailAction`) quando a tela abre.
