# Hexatombe

Portal minimalista e sombrio construído com Angular 22. A página inicial exibe apenas um botão; ao clicar nele, a galeria apresenta os seis personagens e cada card leva à ficha individual do destino. Todos os personagens possuem ficha completa — frase, emblema, atributos e habilidades. O modal de senha continua preservado e pode ser aberto por `/?acesso=senha`.

## Rodando o projeto

```bash
npm install
npm start
```

Abra `http://localhost:4200/`.

> No PowerShell deste ambiente, `npm.ps1` é bloqueado pela política de execução. Use `npm.cmd start`, `npm.cmd run build` ou `cmd /c "npm.cmd test"`.

## Senhas

| Senha         | Personagem    | Rota                     |
| ------------- | ------------- | ------------------------ |
| `descontrole` | Anne Kent     | `/destino/anne-kent`     |
| `loucura`     | David Moura   | `/destino/david-moura`   |
| `lamina`      | Lia Kwon      | `/destino/lia-kwon`      |
| `vazio`       | Cecília Nunes | `/destino/cecilia-nunes` |
| `passado`     | Neófito       | `/destino/neofito`       |
| `abandonado`  | Artur Pires   | `/destino/artur-pires`   |

A comparação ignora caixa, acentos e espaços nas pontas (`LÂMINA`, `lamina` e `Lamina` são equivalentes). Senhas erradas produzem apenas uma mensagem discreta; nenhuma dica é revelada.

## Formas mascaradas

Cada destino guarda uma segunda ficha, a forma mascarada de VD 140. Ela não aparece no documento público: a ficha completa (VD 80) abre liberada pela senha do personagem e mostra, ao pé da página, o selo **Colocar a máscara**, que leva a `/destino/:slug/mascara`.

| Senha     | Vale para        | Rota                     |
| --------- | ---------------- | ------------------------ |
| `mascara` | os seis destinos | `/destino/:slug/mascara` |

A senha da transformação é única e independente das senhas individuais: `mascara` não abre nenhuma ficha VD 80 e a senha de um destino não desperta a máscara. A liberação fica guardada na sessão (`hexatombe:mascaras-liberadas`), então recarregar a página mantém a máscara no rosto, enquanto **Retirar a máscara** volta à ficha comum sem pedir senha outra vez.

## Estrutura

```
src/app/
  core/character/          modelo, fichas, retratos e registro dos personagens (busca por senha/slug)
  features/landing/        botão único que leva à galeria
  features/gallery/        grade responsiva com os seis destinos
  features/character/      página de destino e ficha (retrato, emblema, atributos, habilidades)
  shared/auth-modal/       modal com focus trap, Escape, backdrop e shake no erro
  shared/atmosphere/       névoa, manchas, grão e cinzas puramente em CSS
```

A galeria (`features/gallery/`) reutiliza `characters.data.ts` e os mesmos símbolos da ficha: cada card traz o emblema e o motivo do personagem, sua cor de identidade e um link direto para `/destino/:slug`. A grade tem três colunas no desktop, duas em tablets e uma no celular.

A ficha é montada por componentes declarativos em `features/character/`:

- `character-dossier` — documento com nome, frase, atributos, habilidades e retrato.
- `character-portrait` — retrato em recorte de busto, com moldura escura e fallback automático.
- `character-emblem` — símbolo central em SVG, com uma variante por personagem.
- `character-motif` — traços de fundo que acompanham o emblema.
- `character-attributes` — cinco atributos ao redor do emblema, ligados por traços.
- `character-abilities` — blocos empilhados com ação, custo, limite e descrição.

Tudo vem de `characters.data.ts`: para criar a próxima ficha, basta preencher `dossier` (frase, atributos, habilidades, emblema e `portrait`). Sem `dossier`, a página continua mostrando apenas o nome — mas o card da galeria usa o emblema padrão.

Os retratos têm uma entrada própria em `core/character/character-portraits.ts` (`CHARACTER_PORTRAITS`). Hoje todos apontam para `public/portraits/placeholder.jpg`; para trocar a arte de um destino, basta alterar o `src` da entrada correspondente. Se a imagem falhar, `fallbackSrc` devolve o placeholder automaticamente. Enquanto a arte definitiva não chega, o avatar cinza recebe um blend escuro (`mix-blend-mode: multiply`) para se integrar ao fundo preto; retratos reais mantêm o tratamento normal.

Rotas: `/` (portal), `/galeria` (escolha do personagem), `/destino/:slug` (página do destino), `/destino/:slug/ficha` (ficha completa, VD 80) e `/destino/:slug/mascara` (forma mascarada, VD 140). Um resolver redireciona slugs desconhecidos para `/galeria`; rotas desconhecidas voltam ao portal.

## Scripts

| Comando         | Descrição                                                         |
| --------------- | ----------------------------------------------------------------- |
| `npm start`     | servidor de desenvolvimento                                       |
| `npm run build` | build de produção em `dist/hexatombe`                             |
| `npm test`      | testes unitários com Vitest (`--watch=false` para execução única) |

## Notas de implementação

- Componentes standalone, signals e detecção de mudanças zoneless.
- O retrato é opcional: a coluna direita só reserva espaço quando `portrait` existe. O enquadramento é sempre de busto (`object-fit: cover` com `object-position: center top`), em proporção 4:5 e com dimensões iguais nas seis fichas.
- A imagem fica em `public/portraits/`; texturas continuam em gradientes CSS e SVG inline em `data:` URI, e a tipografia usa fontes do sistema.
- Orçamento de estilo por componente elevado para 8 kB (aviso), mantendo 10 kB como erro, por causa das texturas e animações da ficha e da galeria.
- Títulos de página e transições de rota (`withViewTransitions`) configurados no roteador.
- Acessibilidade: `role="dialog"`, `aria-modal`, foco preso e restaurado, fechamento por Escape/backdrop, `prefers-reduced-motion` respeitado. Na galeria, cada card é um link com foco visível e a página individual mantém um retorno discreto à galeria. Cada retrato tem texto alternativo próprio (`Retrato de …`).
