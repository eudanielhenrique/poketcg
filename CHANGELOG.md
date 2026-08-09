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

### Fixed

- Campos de busca/seleção com fonte abaixo de 16px causavam zoom automático ao focar no iOS — corrigido pra `text-base`.
- Logo do topo ficava sobreposta à barra de status (relógio) em iPhones com notch — header agora respeita `env(safe-area-inset-top)`.
- Service worker cacheava a página HTML com stale-while-revalidate, então depois de um novo deploy o celular continuava vendo a versão anterior (apontando pra arquivos JS que não existiam mais). Navegação (HTML) agora é rede-primeiro; só cache com hash de build (que nunca fica velho, porque a URL muda a cada deploy) usa stale-while-revalidate. O service worker também passou a checar por atualização assim que o app abre e recarrega a página sozinho quando uma versão nova assume, em vez de depender do navegador notar isso por conta própria.

