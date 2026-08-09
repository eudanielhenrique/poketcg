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
- [x] Escanear carta pela câmera, ao vivo: aponta a câmera, lê o quadro atual a cada ~1.5s, trava sozinho quando o mesmo "Nome nº" bate duas vezes seguidas (tipo leitor de código de barras) e pré-preenche a busca já existente. Cai pro fluxo de foto única se a câmera não estiver disponível. Não é reconhecimento visual de imagem (isso exigiria um índice de comparação contra as ~23k imagens da TCGdex — fora de escopo); é leitura de texto, então funciona melhor em cartas com número impresso nítido (Sun/Moon em diante) e menos em cartas WOTC-era com fonte estilizada. Resultado sempre editável antes de buscar, nunca busca/registra sozinho.

## Em andamento

- **Validar o scanner de câmera em dispositivo real.** Construído e testado com imagem sintética (o ambiente de build não tem câmera pra testar `getUserMedia` fim a fim) — precisa confirmar em celular de verdade: câmera abre, permissão funciona, o "trava sozinho" não demora nem erra demais em condições reais de foto (foco, luz, ângulo).

## Planejado

Baseado em revisão de produto de 2026-08-09 (Daniel), priorizado assim por ele — ordem importa aqui, ao contrário do resto da lista:

1. **[ ] Regras reais de deck building**, não só estatísticas: contador "42/60 cartas" em destaque, aviso de "deck incompleto" e de limite de cópias excedido (máx. 4 por carta não-básica de energia — regra fixa do jogo, não vem de API), separação por estágio de evolução (Básico/Estágio 1/Estágio 2) além de categoria.
2. **[ ] Estados vazios e placeholders** — parcialmente feito (verso de carta estilizado). Falta: tela de coleção "faltam" com toggle Todos/Tenho/Faltam, home menos vazia depois do primeiro uso (buscas recentes, últimas cartas vistas, atalho pro deck em andamento).

Itens menores da mesma revisão, sem prioridade definida:

- [ ] Preço com contexto: low/market/high expandível, "atualizado há X horas" (a API já devolve isso em `card.pricing`, só não é consumido ainda), conversão opcional pra BRL
- [ ] Fluxo de adicionar carta simplificado: um botão "+ Adicionar" abrindo bottom sheet com lista de coleções/decks, em vez de dois `<select>`
- [ ] Reduzir a exposição do botão "excluir" nas listas de coleção/deck (menu ••• com renomear/duplicar/excluir)
- [ ] Área de toque dos botões +/- de quantidade maior (~44px), aparência pode continuar igual
- [ ] Impedir exclusão das 9 coleções padrão por geração (ou só permitir ocultar)
- [ ] Filtros de busca avançados (por set, tipo, raridade)
- [ ] Exportar/importar coleção (backup fora do localStorage)
