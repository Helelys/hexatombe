# Hexatombe

Portal minimalista e sombrio construído com Angular 22. A página inicial exibe apenas um botão; ao clicar nele, um modal pede uma senha. Cada senha correta leva a uma página dedicada. Anne Kent já possui uma ficha completa — frase, emblema, atributos e habilidades —, enquanto os demais destinos exibem somente o nome; o restante é atmosfera.

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

## Estrutura

```
src/app/
  core/character/          modelo, fichas e registro dos personagens (busca por senha/slug)
  features/landing/        botão único que abre o modal
  features/character/      página de destino e ficha (emblema, atributos, habilidades)
  shared/auth-modal/       modal com focus trap, Escape, backdrop e shake no erro
  shared/atmosphere/       névoa, manchas, grão e cinzas puramente em CSS
```

A ficha de Anne Kent é montada por componentes declarativos em `features/character/`:

- `character-dossier` — documento com nome, frase e as duas colunas da ficha.
- `character-emblem` — símbolo central em SVG (variante `bulwark`), animado por traço.
- `character-attributes` — cinco atributos ao redor do emblema, ligados por traços.
- `character-abilities` — blocos empilhados com ação, custo, limite e descrição.

Tudo vem de `characters.data.ts`: para criar a próxima ficha, basta preencher `dossier` (frase, atributos, habilidades, emblema e, se houver arte, `portrait`). Sem `dossier`, a página continua mostrando apenas o nome.

Rotas: `/` (portal) e `/destino/:slug`. Um resolver redireciona slugs desconhecidos para `/`.

## Scripts

| Comando         | Descrição                                                         |
| --------------- | ----------------------------------------------------------------- |
| `npm start`     | servidor de desenvolvimento                                       |
| `npm run build` | build de produção em `dist/hexatombe`                             |
| `npm test`      | testes unitários com Vitest (`--watch=false` para execução única) |

## Notas de implementação

- Componentes standalone, signals e detecção de mudanças zoneless.
- A ilustração é opcional: a coluna direita só reserva espaço quando `portrait` existe; Anne Kent ainda não possui arte.
- Nenhum asset externo: texturas são gradientes CSS e SVG inline em `data:` URI; tipografia usa fontes do sistema.
- Orçamento de estilo por componente elevado para 8 kB (aviso), mantendo 10 kB como erro, por causa das texturas e animações da ficha.
- Títulos de página e transições de rota (`withViewTransitions`) configurados no roteador.
- Acessibilidade: `role="dialog"`, `aria-modal`, foco preso e restaurado, fechamento por Escape/backdrop, `prefers-reduced-motion` respeitado.
