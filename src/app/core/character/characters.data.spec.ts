import { CHARACTER_PORTRAITS, PORTRAIT_PLACEHOLDER_SRC } from './character-portraits';
import { CHARACTERS } from './characters.data';

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
    ]);
  });

  it('associa Anne Kent ao emblema de resistência', () => {
    expect(anne?.dossier?.emblem).toBe('bulwark');
  });

  it('usa o retrato provisório centralizado', () => {
    expect(anne?.dossier).toBeDefined();
    expect(anne?.dossier?.portrait).toEqual(CHARACTER_PORTRAITS['anne-kent']);
    expect(anne?.dossier?.portrait?.src).toBe(PORTRAIT_PLACEHOLDER_SRC);
    expect(anne?.dossier?.portrait?.alt).toBe('Retrato de Anne Kent');
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
        cost: '2 PE',
        description:
          'Remove a condição fatigado ou encerra uma penalidade de -2 em testes físicos sofrida até o fim da cena. Uma vez por cena.',
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
        name: 'Troca de Sombra',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Quando é alvo de um ataque, pode mover-se 3 m para cobertura; recebe +5 Defesa contra o ataque que disparou a reação.',
      },
      {
        name: 'Ferida Silenciosa',
        action: 'Padrão',
        cost: '2 PE',
        description:
          'Após acertar Lâmina Oculta, o alvo não pode realizar reações até o início do próximo turno de Lia.',
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
        name: 'Disparo de Contenção',
        action: 'Padrão',
        cost: '2 PE',
        description:
          'Após acertar, o alvo faz Fortitude DT 20. Se falhar, seu deslocamento é reduzido à metade até o fim do próximo turno.',
      },
      {
        name: 'Distância de Segurança',
        action: 'Passiva',
        description: 'Recebe +3 Defesa enquanto não houver inimigo adjacente.',
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
        name: 'Nó de Pensamento',
        action: 'Ritual 2º',
        cost: '3 PE',
        description:
          'Padrão, médio, 1 alvo: Vontade DT 20 evita. Se falhar, sofre -5 em ataques e não pode usar reações até o início do próximo turno.',
      },
      {
        name: 'Poeira Hemática',
        action: 'Ritual 2º',
        cost: '3 PE',
        description:
          'Padrão, curto, 1 alvo: 2d8 Sangue. Fortitude DT 20 reduz à metade; se falhar, também sofre -2 Defesa por 1 rodada.',
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

      it('possui retrato independente com placeholder de segurança', () => {
        expect(character?.dossier?.portrait).toEqual(CHARACTER_PORTRAITS[expected.slug]);
        expect(character?.dossier?.portrait?.src).toBe(PORTRAIT_PLACEHOLDER_SRC);
        expect(character?.dossier?.portrait?.alt).toBe(`Retrato de ${expected.name}`);
        expect(character?.dossier?.portrait?.fallbackSrc).toBe(PORTRAIT_PLACEHOLDER_SRC);
      });
    });
  }
});
