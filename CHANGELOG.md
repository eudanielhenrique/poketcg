# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added

- Projeto inicial: Next.js 16 + TypeScript + Tailwind v4, integrado à API pública do [TCGdex](https://tcgdex.dev) (v2, idioma `en`).
- Busca de cartas por nome com resultados em grade.
- Página de detalhe de carta: imagem, raridade, HP, tipo, ataques, efeito e preço de mercado (Cardmarket/TCGPlayer).
- Coleções nomeadas, com 9 coleções pré-criadas por geração de Pokédex (Kanto a Paldea) semeadas no primeiro uso, cada uma já com todos os Pokémon daquela geração listados — o usuário só escolhe qual carta tem de cada um. Progresso (X/Y registrados) e valor de mercado somado aparecem no topo.
- Decks: criação, registro de cartas com quantidade, e painel de análise (contagem por categoria, por tipo, curva de custo de recuo, HP médio, preço total estimado).
- Persistência 100% local via `localStorage` (sem conta, sem backend).
- Identidade visual própria: paleta escura com acento dourado, navegação translúcida (glass), tipografia editorial e microinterações (hover, press, entrada de cards).
- Shell mobile com cara de app nativo: tab bar fixa no rodapé (Buscar/Coleção/Decks), topo simplificado, `theme-color` e `viewport-fit=cover`.
- Suporte a PWA: manifest (`/manifest.webmanifest`), ícones (192/512/maskable) e service worker com cache stale-while-revalidate — instalável na tela inicial e funciona offline pra conteúdo já visitado.
- Busca por código exato da carta (ex: `base1-4`) além de nome — resolve direto pra carta certa, útil pra cartas sem imagem ou com nome ambíguo. Código da carta (`#4/102`) agora aparece na página de detalhe.
- Modal de preview ao adicionar carta numa coleção ou deck: mostra imagem, set, raridade, código e preço antes de confirmar, em vez de adicionar direto da grade de busca.
- Filtro por nome dentro de uma coleção — filtra o checklist de Pokémon (nas coleções por geração) ou as cartas já registradas (nas coleções livres), sem precisar rolar a lista inteira procurando.
- "Cartas em destaque" na home: 8 clássicos raros (Charizard Skyridge, Umbreon VMAX Evolving Skies, Charizard Base Set, Lugia Neo Genesis, etc.) com preço de mercado real da TCGdex, ordenados do mais caro pro mais barato.
- Busca aceita "Nome nº" (ex: `Pikachu 58` ou `Pikachu 58/102`) pra resolver direto a impressão certa, combinando nome e número impresso na carta na própria consulta à API.
- Fallback de imagem pra pokemontcg.io quando a TCGdex não tem a imagem de uma carta (mesmo ID, quando o esquema coincide). Melhor-esforço: cobre uma fração pequena dos casos, já que a maioria das cartas sem imagem na TCGdex são prints nichados (Trainer Kits, promoções anuais) que a pokemontcg.io também não cataloga.
- "Coleção" agora separa três conceitos em abas: **Pokédex** (progresso por geração, "73/151 Pokémon", já existia mas ganhou barra de progresso e %), **Sets** (novo — acompanhe um set real da TCGdex, ex "Base Set — 62/102 cartas", buscando e escolhendo o set), **Cartas** (as coleções livres de antes). Tocar num slot vazio do checklist de um Set pré-preenche a busca com o ID exato daquela impressão, então resolve sem ambiguidade nenhuma.
- Escanear carta pela câmera: tira uma foto (ou escolhe da galeria), OCR roda no navegador (`tesseract.js`, carregado só quando usado) pra ler o nome e o número impresso, e pré-preenche a busca "Nome nº" já existente. Testado ponta a ponta com imagem sintética — funciona bem em texto nítido; cartas antigas com fonte estilizada devem sair piores, e o resultado sempre fica editável antes de buscar.

### Changed

- Registrar carta numa coleção (tocando num Pokémon vazio do checklist, ou no botão "+ Registrar"/"+ Adicionar cartas") abre um modal de busca em tela cheia, sem rolar a página até uma seção de busca lá embaixo.
- Quando há mais de uma carta registrada pro mesmo Pokémon numa coleção por geração, o slot mostra a última adicionada (antes mostrava sempre a primeira).
- Resultados de busca agora mostram set, código impresso na carta (`4/102`), raridade e preço — antes só o nome, o que tornava impossível distinguir entre várias impressões do mesmo Pokémon sem reconhecer a arte de cor.
- Cartas sem imagem mostram um verso estilizado no lugar do texto "sem imagem".
- Página de detalhe da carta: rótulos de interface traduzidos (Pokémon/Treinador/Energia, Básico/Estágio 1/Estágio 2 — nomes de ataques continuam em inglês, como vêm da fonte oficial), raridade "None" (promo sem raridade definida) escondida em vez de mostrada como texto literal, preço com formatação BRL (ex "US$ 818,65").

### Fixed

- Campos de busca/seleção com fonte abaixo de 16px causavam zoom automático ao focar no iOS — corrigido pra `text-base`.
- Logo do topo ficava sobreposta à barra de status (relógio) em iPhones com notch — header agora respeita `env(safe-area-inset-top)`.
- Service worker cacheava a página HTML com stale-while-revalidate, então depois de um novo deploy o celular continuava vendo a versão anterior (apontando pra arquivos JS que não existiam mais). Navegação (HTML) agora é rede-primeiro; só cache com hash de build (que nunca fica velho, porque a URL muda a cada deploy) usa stale-while-revalidate. O service worker também passou a checar por atualização assim que o app abre e recarrega a página sozinho quando uma versão nova assume, em vez de depender do navegador notar isso por conta própria.

