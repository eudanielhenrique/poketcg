# Roadmap

## Feito

- [x] Busca de cartas por nome via TCGdex
- [x] Página de detalhe com preço de mercado
- [x] Coleções nomeadas + 9 presets por geração de Pokédex (checklist completo, não lista vazia)
- [x] Decks com registro de cartas e quantidade
- [x] Análise de deck: categoria, tipo, curva de recuo, HP médio, preço total
- [x] Identidade visual própria (dark, glass, tipografia editorial)
- [x] PWA (manifest, ícones, service worker com auto-atualização)
- [x] Shell mobile com tab bar fixa
- [x] Modal de preview + modal de busca em tela cheia ao adicionar carta
- [x] Identificação de versão na busca: set, código impresso (`4/102`), raridade, preço — resolve o problema de "vários Charizard, qual é qual"
- [x] Busca aceita "Nome nº" (ex: `Pikachu 58`), além de nome livre e ID exato
- [x] Verso de carta estilizado no lugar do texto "sem imagem", com fallback pontual pra pokemontcg.io quando ela tem a imagem que a TCGdex não tem
- [x] Coleções → Pokédex/Sets/Cartas como conceitos separados, em abas. Pokédex ganhou barra de progresso e %; Sets é novo — busca e acompanha um set real da TCGdex, com checklist que resolve cada slot vazio pelo ID exato da impressão (sem ambiguidade); Cartas continua sendo as coleções livres de antes.

## Em andamento

- Nenhum item em aberto no momento.

## Planejado

Baseado em revisão de produto de 2026-08-09 (Daniel), priorizado assim por ele — ordem importa aqui, ao contrário do resto da lista:

1. **[ ] Regras reais de deck building**, não só estatísticas: contador "42/60 cartas" em destaque, aviso de "deck incompleto" e de limite de cópias excedido (máx. 4 por carta não-básica de energia — regra fixa do jogo, não vem de API), separação por estágio de evolução (Básico/Estágio 1/Estágio 2) além de categoria.
2. **[ ] Estados vazios e placeholders** — parcialmente feito (verso de carta estilizado). Falta: tela de coleção "faltam" com toggle Todos/Tenho/Faltam, home menos vazia depois do primeiro uso (buscas recentes, últimas cartas vistas, atalho pro deck em andamento).

Pedido separado do mesmo dia (Daniel): **escanear carta pela câmera e preencher a coleção automaticamente.** Reconhecimento visual de verdade (comparar a foto contra as imagens da TCGdex) é um projeto grande — precisaria de um índice de comparação contra ~23k imagens, não é algo pra uma sessão só. Caminho mais realista, ainda não construído: capturar foto → OCR (leitura de texto, ex `tesseract.js`, roda no navegador) no nome + número impresso da carta → cair na busca "Nome nº" que já existe e já resolve com precisão. Funciona melhor em cartas modernas (número bem definido na base); cartas WOTC-era antigas têm layout menos previsível pra OCR.

Itens menores da mesma revisão, sem prioridade definida:

- [ ] Preço com contexto: low/market/high expandível, "atualizado há X horas" (a API já devolve isso em `card.pricing`, só não é consumido ainda), conversão opcional pra BRL
- [ ] Fluxo de adicionar carta simplificado: um botão "+ Adicionar" abrindo bottom sheet com lista de coleções/decks, em vez de dois `<select>`
- [ ] Reduzir a exposição do botão "excluir" nas listas de coleção/deck (menu ••• com renomear/duplicar/excluir)
- [ ] Área de toque dos botões +/- de quantidade maior (~44px), aparência pode continuar igual
- [ ] Impedir exclusão das 9 coleções padrão por geração (ou só permitir ocultar)
- [ ] Filtros de busca avançados (por set, tipo, raridade)
- [ ] Exportar/importar coleção (backup fora do localStorage)
