import { Character } from './character.model';
import { CHARACTER_PORTRAITS } from './character-portraits';
import { CHARACTER_SHEETS } from './character-sheets';
import { MASKED_FORMS } from './masked-forms';

/**
 * Registro central dos destinos do portal.
 * As senhas são comparadas depois de normalizadas (sem acentos, caixa ou espaços nas pontas).
 */
export const CHARACTERS: readonly Character[] = [
  {
    slug: 'anne-kent',
    name: 'Anne Kent',
    password: 'descontrole',
    theme: {
      accent: '#b3121b',
      glow: 'rgba(179, 18, 27, 0.4)',
      mood: 'tremor',
    },
    sheet: CHARACTER_SHEETS['anne-kent'],
    maskedForm: MASKED_FORMS['anne-kent'],
    dossier: {
      quote: 'Se alguém precisa ficar de pé, serei eu.',
      emblem: 'bulwark',
      portrait: CHARACTER_PORTRAITS['anne-kent'],
      attributes: [
        { key: 'AGI', value: 1 },
        { key: 'FOR', value: 4 },
        { key: 'INT', value: 1 },
        { key: 'PRE', value: 2 },
        { key: 'VIG', value: 4 },
      ],
      abilities: [
        {
          name: 'Casca Bruta',
          action: 'Passiva',
          description: 'Anne recebe RD 5 contra dano físico.',
        },
        {
          name: 'Retaliação Furiosa',
          action: 'Reação',
          limit: '1/rodada',
          description:
            'Ao sofrer dano corpo a corpo, reduz o dano em 1d10+4. O agressor faz Fortitude DT 20 ou é empurrado 1,5 m.',
        },
        {
          name: 'Fúria Crescente',
          action: 'Passiva',
          description:
            'Ao perder PV, seu próximo ataque de punhos até o fim do próximo turno causa +1d8. Uma vez por rodada.',
        },
      ],
    },
  },
  {
    slug: 'david-moura',
    name: 'David Moura',
    password: 'loucura',
    theme: {
      accent: '#a8101a',
      glow: 'rgba(168, 16, 26, 0.4)',
      mood: 'frenzy',
    },
    sheet: CHARACTER_SHEETS['david-moura'],
    maskedForm: MASKED_FORMS['david-moura'],
    dossier: {
      quote: 'Correr só decide onde o impacto acontece.',
      emblem: 'ram',
      portrait: CHARACTER_PORTRAITS['david-moura'],
      attributes: [
        { key: 'AGI', value: 2 },
        { key: 'FOR', value: 4 },
        { key: 'INT', value: 1 },
        { key: 'PRE', value: 2 },
        { key: 'VIG', value: 3 },
      ],
      abilities: [
        {
          name: 'Impacto Acumulado',
          action: 'Passiva',
          description:
            'Uma vez por rodada, ao acertar um alvo com metade ou menos dos PV, causa +1d8 de dano corpo a corpo.',
        },
        {
          name: 'Pressão Constante',
          action: 'Reação',
          limit: '1/rodada',
          description:
            'Quando um inimigo adjacente tenta se afastar, David pode se deslocar 3 m em direção a ele. Esse movimento não gera ataque.',
        },
        {
          name: 'Fôlego de Aço',
          action: 'Livre',
          limit: '1/cena',
          description:
            'Remove a condição fatigado ou encerra uma penalidade de -2 em testes físicos sofrida até o fim da cena.',
        },
      ],
    },
  },
  {
    slug: 'lia-kwon',
    name: 'Lia Kwon',
    password: 'lamina',
    theme: {
      accent: '#8f1522',
      glow: 'rgba(143, 21, 34, 0.34)',
      mood: 'edge',
    },
    sheet: CHARACTER_SHEETS['lia-kwon'],
    maskedForm: MASKED_FORMS['lia-kwon'],
    dossier: {
      quote: 'O silêncio corta mais fundo.',
      emblem: 'edge',
      portrait: CHARACTER_PORTRAITS['lia-kwon'],
      attributes: [
        { key: 'AGI', value: 4 },
        { key: 'FOR', value: 3 },
        { key: 'INT', value: 2 },
        { key: 'PRE', value: 2 },
        { key: 'VIG', value: 1 },
      ],
      abilities: [
        {
          name: 'Manto de Sombra',
          action: 'Passiva',
          description: 'Recebe +2 Defesa enquanto estiver em cobertura ou na penumbra.',
        },
        {
          name: 'Corte Preciso',
          action: 'Passiva',
          description:
            'Contra alvo desprevenido ou flanqueado, seus ataques com katana causam +2d6 de precisão.',
        },
        {
          name: 'Passo Leve',
          action: 'Passiva',
          description:
            'Ignora penalidade de deslocamento causada por terreno difícil não paranormal.',
        },
      ],
    },
  },
  {
    slug: 'cecilia-nunes',
    name: 'Cecília Nunes',
    password: 'vazio',
    theme: {
      accent: '#b23540',
      glow: 'rgba(178, 53, 64, 0.3)',
      mood: 'void',
    },
    sheet: CHARACTER_SHEETS['cecilia-nunes'],
    maskedForm: MASKED_FORMS['cecilia-nunes'],
    dossier: {
      quote: 'A distância é minha. O erro é seu.',
      emblem: 'sight',
      portrait: CHARACTER_PORTRAITS['cecilia-nunes'],
      attributes: [
        { key: 'AGI', value: 3 },
        { key: 'FOR', value: 1 },
        { key: 'INT', value: 3 },
        { key: 'PRE', value: 2 },
        { key: 'VIG', value: 3 },
      ],
      abilities: [
        {
          name: 'Respiração Travada',
          action: 'Passiva',
          description:
            'Se não se deslocar no turno, o próximo disparo de fuzil até o fim do turno seguinte causa +2d10.',
        },
        {
          name: 'Tiro Perfurante',
          action: 'Padrão',
          limit: '1/rodada',
          description: 'O disparo ignora 5 pontos de resistência a dano do alvo.',
        },
        {
          name: 'Mira Calibrada',
          action: 'Passiva',
          description:
            'Se mirar por uma ação de movimento, recebe +5 no próximo disparo até o fim do próximo turno.',
        },
      ],
    },
  },
  {
    slug: 'neofito',
    name: 'Neófito',
    password: 'passado',
    theme: {
      accent: '#7f2b21',
      glow: 'rgba(127, 43, 33, 0.34)',
      mood: 'relic',
    },
    sheet: CHARACTER_SHEETS['neofito'],
    maskedForm: MASKED_FORMS.neofito,
    dossier: {
      quote: 'O sangue lembra o que os livros esquecem.',
      emblem: 'ritual',
      portrait: CHARACTER_PORTRAITS['neofito'],
      attributes: [
        { key: 'AGI', value: 1 },
        { key: 'FOR', value: 1 },
        { key: 'INT', value: 4 },
        { key: 'PRE', value: 4 },
        { key: 'VIG', value: 2 },
      ],
      abilities: [
        {
          name: 'Oferenda de Sangue',
          action: 'Livre',
          description:
            'Sacrifica PV reais para potencializar o próximo ritual de dano ou cura. Custo e bônus dependem da ficha final aprovada e são configurados na mesa de combate. Nunca consome PV temporários.',
        },
        {
          name: 'Prece de Ferida',
          action: 'Livre',
          description:
            'Sacrifício curto em PV reais que prepara o próximo ritual. Se o PV real chegar a zero, o bônus fica pendente.',
        },
        {
          name: 'Foco Ritual',
          action: 'Passiva',
          description:
            'Uma vez por rodada, se não tiver se deslocado neste turno, recebe +2 na DT do próximo ritual que lançar antes do fim do turno.',
        },
      ],
    },
  },
  {
    slug: 'artur-pires',
    name: 'Artur Pires',
    password: 'abandonado',
    theme: {
      accent: '#97392c',
      glow: 'rgba(151, 57, 44, 0.32)',
      mood: 'cold',
    },
    sheet: CHARACTER_SHEETS['artur-pires'],
    maskedForm: MASKED_FORMS['artur-pires'],
    dossier: {
      quote: 'O que sobra ainda pode salvar alguém.',
      emblem: 'scrap',
      portrait: CHARACTER_PORTRAITS['artur-pires'],
      attributes: [
        { key: 'AGI', value: 2 },
        { key: 'FOR', value: 2 },
        { key: 'INT', value: 3 },
        { key: 'PRE', value: 3 },
        { key: 'VIG', value: 2 },
      ],
      abilities: [
        {
          name: 'Mochila Improvisada',
          action: 'Padrão',
          limit: '3 cargas/cena',
          description:
            'Escolhe um aliado em alcance curto: cura 2d8+4 PV ou recebe +5 no próximo teste de ataque até o fim do próximo turno.',
        },
        {
          name: 'Cobertura de Sucata',
          action: 'Reação',
          limit: '1/rodada',
          description:
            'Quando um aliado em alcance curto é atacado, recebe +5 Defesa contra aquele ataque.',
        },
        {
          name: 'Troca de Ferramenta',
          action: 'Livre',
          limit: '1/rodada',
          description:
            'Saca ou guarda uma arma que esteja carregando sem gastar ação de movimento.',
        },
      ],
    },
  },
];
