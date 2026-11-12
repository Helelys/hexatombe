import { Character } from './character.model';

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
    dossier: {
      quote: 'Se alguém precisa ficar de pé, serei eu.',
      emblem: 'bulwark',
      attributes: [
        { key: 'AGI', value: 1 },
        { key: 'FOR', value: 4 },
        { key: 'INT', value: 1 },
        { key: 'PRE', value: 2 },
        { key: 'VIG', value: 4 },
      ],
      abilities: [
        {
          name: 'Base Plantada',
          action: 'Reação',
          limit: '1/rodada',
          description:
            'Ao sofrer dano de um ataque corpo a corpo, reduz o dano em 1d10+4. Se não se deslocou no turno anterior, reduz mais 3.',
        },
        {
          name: 'Arranco',
          action: 'Padrão',
          cost: '2 PE',
          description:
            'Após acertar Pancada, empurra o alvo 3 m. Se ele colidir com uma superfície, sofre +1d8 impacto. Fortitude DT 20 evita o deslocamento.',
        },
        {
          name: 'Ombro de Guarda',
          action: 'Livre',
          cost: '1 PE',
          description:
            'Escolhe um aliado adjacente; ele recebe +2 Defesa até o início do próximo turno de Anne. Uma vez por rodada.',
        },
      ],
    },
  },
  {
    slug: 'david-moura',
    name: 'David Moura',
    password: 'loucura',
    theme: {
      accent: '#8b0018',
      glow: 'rgba(139, 0, 24, 0.36)',
      mood: 'frenzy',
    },
  },
  {
    slug: 'lia-kwon',
    name: 'Lia Kwon',
    password: 'lamina',
    theme: {
      accent: '#9aa0a6',
      glow: 'rgba(154, 160, 166, 0.26)',
      mood: 'edge',
    },
  },
  {
    slug: 'cecilia-nunes',
    name: 'Cecília Nunes',
    password: 'vazio',
    theme: {
      accent: '#c9c2c2',
      glow: 'rgba(201, 194, 194, 0.22)',
      mood: 'void',
    },
  },
  {
    slug: 'neofito',
    name: 'Neófito',
    password: 'passado',
    theme: {
      accent: '#8a6a52',
      glow: 'rgba(138, 106, 82, 0.28)',
      mood: 'relic',
    },
  },
  {
    slug: 'artur-pires',
    name: 'Artur Pires',
    password: 'abandonado',
    theme: {
      accent: '#6f5a5e',
      glow: 'rgba(111, 90, 94, 0.3)',
      mood: 'cold',
    },
  },
];
