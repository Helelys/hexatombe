import { CHARACTER_PORTRAITS, PORTRAIT_PLACEHOLDER_SRC } from './character-portraits';
import { CHARACTERS } from './characters.data';

/** Artes oficiais publicadas para cada destino. */
const OFFICIAL_PORTRAITS = {
  'anne-kent': 'https://i.imgur.com/4AugKVL.png',
  'david-moura': 'https://i.imgur.com/W2wu8U7.png',
  'lia-kwon': 'https://i.imgur.com/Wih09mz.png',
  'cecilia-nunes': 'https://i.imgur.com/w1ID7JY.png',
  neofito: 'https://i.imgur.com/nviA3Je.png',
  'artur-pires': 'https://i.imgur.com/vuFqW67.png',
} as const;

describe('CHARACTERS', () => {
  const anne = CHARACTERS.find((character) => character.slug === 'anne-kent');

  it('reserva ficha completa para os seis personagens do portal', () => {
    const withDossier = CHARACTERS.filter((character) => character.dossier).map(
      (character) => character.slug,
    );

    expect(withDossier).toEqual([
      'anne-kent',
      'david-moura',
      'lia-kwon',
      'cecilia-nunes',
      'neofito',
      'artur-pires',
    ]);
  });

  it('mantém a frase de Anne Kent', () => {
    expect(anne?.dossier?.quote).toBe('Se alguém precisa ficar de pé, serei eu.');
  });

  it('mantém os cinco atributos de Anne Kent', () => {
    expect(anne?.dossier?.attributes).toEqual([
      { key: 'AGI', value: 1 },
      { key: 'FOR', value: 4 },
      { key: 'INT', value: 1 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 4 },
    ]);
  });

  it('mantém as três habilidades de Anne Kent', () => {
    expect(anne?.dossier?.abilities).toEqual([
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
    ]);
  });

  it('associa Anne Kent ao emblema de resistência', () => {
    expect(anne?.dossier?.emblem).toBe('bulwark');
  });

  it('usa a arte oficial de Anne Kent', () => {
    expect(anne?.dossier).toBeDefined();
    expect(anne?.dossier?.portrait).toEqual(CHARACTER_PORTRAITS['anne-kent']);
    expect(anne?.dossier?.portrait?.src).toBe(OFFICIAL_PORTRAITS['anne-kent']);
    expect(anne?.dossier?.portrait?.alt).toBe('Retrato de Anne Kent');
  });

  it('publica exatamente as artes oficiais dos seis destinos', () => {
    const portraits = Object.fromEntries(
      CHARACTERS.map((character) => [character.slug, character.dossier?.portrait?.src]),
    );

    expect(portraits).toEqual(OFFICIAL_PORTRAITS);
  });
});

const DAVID_E_LIA = [
  {
    slug: 'david-moura',
    name: 'David Moura',
    password: 'loucura',
    mood: 'frenzy',
    quote: 'Correr só decide onde o impacto acontece.',
    emblem: 'ram',
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
  {
    slug: 'lia-kwon',
    name: 'Lia Kwon',
    password: 'lamina',
    mood: 'edge',
    quote: 'O silêncio corta mais fundo.',
    emblem: 'edge',
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
] as const;

const CECILIA_NEOFITO_E_ARTUR = [
  {
    slug: 'cecilia-nunes',
    name: 'Cecília Nunes',
    password: 'vazio',
    mood: 'void',
    quote: 'A distância é minha. O erro é seu.',
    emblem: 'sight',
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
  {
    slug: 'neofito',
    name: 'Neófito',
    password: 'passado',
    mood: 'relic',
    quote: 'O sangue lembra o que os livros esquecem.',
    emblem: 'ritual',
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
  {
    slug: 'artur-pires',
    name: 'Artur Pires',
    password: 'abandonado',
    mood: 'cold',
    quote: 'O que sobra ainda pode salvar alguém.',
    emblem: 'scrap',
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
        description: 'Saca ou guarda uma arma que esteja carregando sem gastar ação de movimento.',
      },
    ],
  },
] as const;

describe('fichas dos personagens restantes', () => {
  for (const expected of [...DAVID_E_LIA, ...CECILIA_NEOFITO_E_ARTUR]) {
    describe(expected.name, () => {
      const character = CHARACTERS.find((entry) => entry.slug === expected.slug);

      it('mantém nome, senha, humor e ficha exata', () => {
        expect(character?.name).toBe(expected.name);
        expect(character?.password).toBe(expected.password);
        expect(character?.theme.mood).toBe(expected.mood);
        expect(character?.dossier).toEqual({
          quote: expected.quote,
          emblem: expected.emblem,
          portrait: CHARACTER_PORTRAITS[expected.slug],
          attributes: expected.attributes,
          abilities: expected.abilities,
        });
      });

      it('possui arte própria com placeholder de segurança', () => {
        expect(character?.dossier?.portrait).toEqual(CHARACTER_PORTRAITS[expected.slug]);
        expect(character?.dossier?.portrait?.src).toBe(OFFICIAL_PORTRAITS[expected.slug]);
        expect(character?.dossier?.portrait?.alt).toBe(`Retrato de ${expected.name}`);
        expect(character?.dossier?.portrait?.fallbackSrc).toBe(PORTRAIT_PLACEHOLDER_SRC);
      });
    });
  }
});
