import { MaskedForm } from './character.model';

/** Classificação de todas as formas mascaradas. */
export const MASKED_GRADE = '140';

/**
 * Nota comum às seis transformações.
 *
 * A máscara apresenta os valores máximos da forma VD 140, mas não devolve
 * recursos: os PV atuais continuam os mesmos e o PE é compartilhado entre as
 * duas formas. Não existe segunda barra de vida.
 */
export const MASKED_FORM_NOTE =
  'A transformação não recupera PV nem PE: os pontos de vida atuais permanecem os mesmos e o esforço é compartilhado entre as duas formas.';

/**
 * Formas mascaradas dos seis destinos, na versão VD 140.
 *
 * As senhas individuais continuam apenas em `characters.data.ts`; a liberação
 * destas fichas usa a senha única da transformação, guardada em `mask-access`.
 */
export const MASKED_FORMS = {
  'anne-kent': {
    name: 'O Lastro',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 1 },
      { key: 'FOR', value: 5 },
      { key: 'INT', value: 1 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 5 },
    ],
    sheet: {
      age: 'X',
      defense: '31',
      fortitude: '5d20+15',
      reflexes: '1d20+10',
      will: '2d20+10',
      hitPoints: '280',
      wounded: '140',
      effortPoints: '10',
      speed: '9m',
      perception: '2d20+10',
      initiative: '1d20+10',
      skills: [
        { name: 'Atletismo', dice: '5d20', modifier: '+15' },
        { name: 'Fortitude', dice: '5d20', modifier: '+15' },
        { name: 'Intimidação', dice: '2d20', modifier: '+15' },
        { name: 'Luta', dice: '5d20', modifier: '+15' },
        { name: 'Percepção', dice: '2d20', modifier: '+10' },
        { name: 'Pilotagem', dice: '1d20', modifier: '+10' },
      ],
      actions: [
        {
          name: 'Punhos de Lastro',
          range: 'Corpo a corpo',
          test: 'Luta 5d20+15',
          damage: '4d6+18',
          damageType: 'Impacto',
          critical: '20/x2',
        },
        {
          name: 'Queda de Muralha',
          action: 'Padrão',
          cost: '3 PE',
          range: 'Alvo adjacente',
          test: 'Reflexos DT 23',
          damage: '3d8+16',
          damageType: 'Impacto',
          description: 'Reflexos DT 23 reduz o dano à metade. Se falhar, o alvo também fica caído.',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Pilar de Aço',
        action: 'Passiva',
        description:
          'Enquanto estiver adjacente a um aliado, recebe +2 Defesa e +5 em testes para resistir a manobras.',
      },
      {
        name: 'Parede Viva',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Quando um aliado a até 6m sofre dano, reduz esse dano em 2d10+8. Anne precisa estar consciente.',
      },
      {
        name: 'Pressão de Cerco',
        action: 'Padrão',
        cost: '2 PE',
        description:
          'Um alvo adjacente faz Fortitude DT 23. Se falhar, sofre -5 em ataques e não pode se afastar voluntariamente de Anne até o fim do próximo turno.',
      },
    ],
    intention: {
      name: 'Fúria Inabalável',
      action: 'Padrão',
      cost: '3 PE',
      limit: '1/cena',
      description:
        'Por 3 rodadas, a primeira vez em cada rodada que um aliado a até 6m sofrer dano, reduza-o em 1d10+5. Se o aliado estiver adjacente, a redução é 1d10+8.',
    },
  },
  'david-moura': {
    name: 'Gume',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 2 },
      { key: 'FOR', value: 5 },
      { key: 'INT', value: 1 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 4 },
    ],
    sheet: {
      age: 'X',
      defense: '29',
      fortitude: '4d20+15',
      reflexes: '2d20+10',
      will: '2d20+10',
      hitPoints: '230',
      wounded: '115',
      effortPoints: '12',
      speed: '9m',
      perception: '2d20+10',
      initiative: '2d20+10',
      skills: [
        { name: 'Atletismo', dice: '5d20', modifier: '+15' },
        { name: 'Fortitude', dice: '4d20', modifier: '+15' },
        { name: 'Intimidação', dice: '2d20', modifier: '+10' },
        { name: 'Luta', dice: '5d20', modifier: '+20' },
        { name: 'Percepção', dice: '2d20', modifier: '+10' },
        { name: 'Reflexos', dice: '2d20', modifier: '+10' },
      ],
      actions: [
        {
          name: 'Facão Gume',
          range: 'Corpo a corpo',
          test: 'Luta 5d20+20',
          damage: '4d8+20',
          damageType: 'Corte',
          critical: '18/x3',
        },
        {
          name: 'Golpe de Quebra',
          action: 'Padrão',
          cost: '3 PE',
          range: 'Corpo a corpo',
          damage: '+2d8',
          description: 'Ataque corpo a corpo. Ignora 5 pontos de resistência a dano do alvo.',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Pressão de Abate',
        action: 'Passiva',
        description:
          'Contra alvos com metade ou menos dos PV, seus ataques corpo a corpo causam +2d8. Substitui, não acumula com Impacto Acumulado.',
      },
      {
        name: 'Ímpeto Final',
        action: 'Livre',
        limit: '1/rodada',
        description:
          'Quando reduz um alvo a 0 PV, pode se deslocar 3m e recebe +2 no próximo teste de ataque até o fim do próximo turno.',
      },
      {
        name: 'Fôlego de Guerra',
        action: 'Reação',
        cost: '2 PE',
        limit: '1/rodada',
        description:
          'Ao sofrer dano, recebe +5 em Fortitude até o início do próximo turno. Uma vez por rodada.',
      },
    ],
    intention: {
      name: 'Corte de Sentença',
      action: 'Padrão',
      cost: '3 PE',
      limit: '1/cena',
      description:
        'Marca um alvo visível. O próximo ataque corpo a corpo que acertá-lo em até 2 rodadas causa +5d8. Se o alvo já estiver abaixo da metade dos PV, causa +2d8 adicionais.',
    },
  },
  'lia-kwon': {
    name: 'Risco',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 5 },
      { key: 'FOR', value: 3 },
      { key: 'INT', value: 2 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 2 },
    ],
    sheet: {
      age: 'X',
      defense: '31',
      fortitude: '2d20+10',
      reflexes: '5d20+15',
      will: '2d20+10',
      hitPoints: '166',
      wounded: '83',
      effortPoints: '13',
      speed: '12m',
      perception: '2d20+10',
      initiative: '5d20+15',
      skills: [
        { name: 'Acrobacia', dice: '5d20', modifier: '+15' },
        { name: 'Crime', dice: '5d20', modifier: '+15' },
        { name: 'Furtividade', dice: '5d20', modifier: '+15' },
        { name: 'Luta', dice: '3d20', modifier: '+15' },
        { name: 'Percepção', dice: '2d20', modifier: '+10' },
        { name: 'Reflexos', dice: '5d20', modifier: '+15' },
      ],
      actions: [
        {
          name: 'Lâmina do Risco',
          range: 'Corpo a corpo',
          test: 'Luta 3d20+15',
          damage: '3d4+12',
          damageType: 'Perfuração',
          critical: '17/x3',
        },
        {
          name: 'Ataque de Abertura',
          action: 'Livre',
          limit: '1/rodada',
          damage: '+5d6',
          damageType: 'Precisão',
          description: 'Contra alvo desprevenido ou flanqueado, causa +5d6 de dano de precisão.',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Desaparecer',
        action: 'Reação',
        limit: '2/cena',
        description:
          'Quando é atacada, recebe +10 Defesa contra esse ataque e pode mover-se 3m após sua resolução.',
      },
      {
        name: 'Ponto Cego',
        action: 'Livre',
        cost: '2 PE',
        description:
          'Após acertar um alvo, ele perde a capacidade de realizar reações até o início do próximo turno. Cada alvo só pode sofrer isso uma vez por cena.',
      },
      {
        name: 'Passo Impossível',
        action: 'Passiva',
        description:
          'Pode atravessar o espaço de inimigos durante seu deslocamento, mas não pode terminar o movimento nele.',
      },
    ],
    intention: {
      name: 'Marca na Garganta',
      action: 'Padrão',
      cost: '3 PE',
      description:
        'Escolhe um alvo em alcance médio por 3 rodadas. Recebe +2 em ataques e +1 na margem de ameaça contra ele. Uma vez por rodada, ao acertá-lo, causa +2d6 de precisão.',
    },
  },
  'cecilia-nunes': {
    name: 'Vigília',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 4 },
      { key: 'FOR', value: 1 },
      { key: 'INT', value: 4 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 3 },
    ],
    sheet: {
      age: 'X',
      defense: '29',
      fortitude: '3d20+10',
      reflexes: '4d20+15',
      will: '2d20+10',
      hitPoints: '180',
      wounded: '90',
      effortPoints: '12',
      speed: '9m',
      perception: '3d20+10',
      initiative: '4d20+15',
      skills: [
        { name: 'Pontaria', dice: '4d20', modifier: '+20' },
        { name: 'Percepção', dice: '3d20', modifier: '+15' },
        { name: 'Furtividade', dice: '4d20', modifier: '+10' },
        { name: 'Investigação', dice: '4d20', modifier: '+15' },
        { name: 'Reflexos', dice: '4d20', modifier: '+15' },
        { name: 'Sobrevivência', dice: '4d20', modifier: '+10' },
      ],
      actions: [
        {
          name: 'Fuzil Vigília',
          range: 'Médio/Longo',
          test: 'Pontaria 4d20+20',
          damage: '4d10+20',
          damageType: 'Balístico',
          critical: '17/x3',
          description: 'Após dois disparos, recarregar custa uma ação de movimento.',
        },
        {
          name: 'Restrição de Alcance',
          description:
            'O fuzil exige um alvo a pelo menos 9m. Não dispara contra alvos adjacentes ou em alcance curto. Sem ataque corpo a corpo relevante; precisa recuar ou usar cobertura.',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Respiração Travada',
        action: 'Passiva',
        description:
          'Se não se deslocar no turno, o próximo disparo até o fim do turno seguinte causa +3d10.',
      },
      {
        name: 'Disparo de Contenção',
        action: 'Padrão',
        cost: '3 PE',
        description:
          'Após acertar, o alvo faz Fortitude DT 23. Se falhar, não pode realizar ação de movimento no próximo turno.',
      },
      {
        name: 'Linha de Execução',
        action: 'Padrão',
        cost: '2 PE',
        description:
          'Se tiver mirado no turno anterior, o disparo causa +2d10. Contra alvo abaixo da metade dos PV, causa +2d10 adicionais.',
      },
    ],
    intention: {
      name: 'Ângulo Impossível',
      action: 'Padrão',
      cost: '3 PE',
      description:
        'Escolhe um alvo visível. O próximo disparo mirado contra ele em até 2 rodadas causa +4d10 e recebe +2 na margem de ameaça. Cobertura total ainda bloqueia o tiro.',
    },
  },
  neofito: {
    name: 'Cartógrafo',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 1 },
      { key: 'FOR', value: 1 },
      { key: 'INT', value: 5 },
      { key: 'PRE', value: 5 },
      { key: 'VIG', value: 2 },
    ],
    sheet: {
      age: 'X',
      defense: '28',
      fortitude: '2d20+10',
      reflexes: '1d20+10',
      will: '4d20+15',
      hitPoints: '196',
      wounded: '98',
      effortPoints: '18',
      speed: '9m',
      perception: '3d20+10',
      initiative: '1d20+10',
      skills: [
        { name: 'Ciências', dice: '5d20', modifier: '+15' },
        { name: 'Investigação', dice: '5d20', modifier: '+15' },
        { name: 'Intuição', dice: '4d20', modifier: '+15' },
        { name: 'Medicina', dice: '5d20', modifier: '+10' },
        { name: 'Ocultismo', dice: '5d20', modifier: '+20' },
        { name: 'Vontade', dice: '4d20', modifier: '+15' },
      ],
      actions: [
        {
          name: 'Bastão Cartográfico',
          range: 'Corpo a corpo',
          test: 'Luta 1d20+10',
          damage: '1d8+8',
          damageType: 'Impacto',
          critical: '20/x2',
        },
        {
          name: 'Estilhaço de Eco',
          category: 'Ritual de 2º círculo',
          action: 'Padrão',
          cost: '3 PE',
          range: 'Médio',
          test: 'Reflexos DT 23',
          damage: '6d8',
          damageType: 'Energia',
          description: 'Um alvo. Reflexos DT 23 reduz o dano à metade.',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Nó de Pensamento',
        category: 'Ritual de 2º círculo',
        action: 'Padrão',
        cost: '3 PE',
        description:
          'Alcance médio, um alvo. Vontade DT 23 evita. Na falha, sofre -5 em ataques e fica sem reações por 2 rodadas. O alvo repete Vontade no fim de cada turno.',
      },
      {
        name: 'Poeira Hemática',
        category: 'Ritual de 2º círculo',
        action: 'Padrão',
        cost: '3 PE',
        description:
          'Alcance curto, um alvo. Causa 4d8 Sangue. Fortitude DT 23 reduz à metade. Na falha, sofre -5 Defesa por 1 rodada.',
      },
      {
        name: 'Foco Ritual',
        action: 'Passiva',
        description:
          'Se não se deslocar no turno, recebe +3 na DT do próximo ritual que lançar antes do fim do turno.',
      },
    ],
    intention: {
      name: 'Geometria do Pavor',
      action: 'Padrão',
      cost: '4 PE',
      limit: '1/cena',
      description:
        'Até 3 inimigos em alcance médio fazem Vontade DT 23. Na falha, sofrem -5 Defesa e -5 nos testes de resistência contra o próximo ritual de Neófito até o fim do próximo turno.',
    },
  },
  'artur-pires': {
    name: 'Espólio',
    grade: MASKED_GRADE,
    attributes: [
      { key: 'AGI', value: 2 },
      { key: 'FOR', value: 3 },
      { key: 'INT', value: 4 },
      { key: 'PRE', value: 4 },
      { key: 'VIG', value: 3 },
    ],
    sheet: {
      age: 'X',
      defense: '28',
      fortitude: '3d20+10',
      reflexes: '2d20+10',
      will: '3d20+15',
      hitPoints: '200',
      wounded: '100',
      effortPoints: '12',
      speed: '9m',
      perception: '2d20+10',
      initiative: '2d20+10',
      skills: [
        { name: 'Investigação', dice: '4d20', modifier: '+15' },
        { name: 'Luta', dice: '3d20', modifier: '+15' },
        { name: 'Medicina', dice: '4d20', modifier: '+15' },
        { name: 'Percepção', dice: '2d20', modifier: '+10' },
        { name: 'Pontaria', dice: '3d20', modifier: '+15' },
        { name: 'Tecnologia', dice: '4d20', modifier: '+15' },
      ],
      actions: [
        {
          name: 'Escopeta Remendada',
          range: 'Curto/Médio',
          test: 'Pontaria 3d20+15',
          damage: '3d8+12',
          damageType: 'Balístico',
          critical: '20/x3',
        },
        {
          name: 'Facão de Oficina',
          range: 'Corpo a corpo',
          test: 'Luta 3d20+15',
          damage: '2d8+10',
          damageType: 'Corte',
          critical: '19/x2',
        },
        {
          name: 'Revólver',
          range: 'Médio',
          test: 'Pontaria 3d20+15',
          damage: '3d6+10',
          damageType: 'Balístico',
          critical: '19/x3',
        },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Mochila Improvisada',
        action: 'Padrão',
        limit: '4 cargas/cena',
        description:
          'Aliado em alcance curto: cura 3d8+6 PV ou recebe +5 no próximo ataque e +2 Defesa até o início do próximo turno.',
      },
      {
        name: 'Cobertura de Sucata',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Aliado em alcance curto recebe RD 5 contra o dano do ataque. Se estiver adjacente, recebe RD 5 + 1d8.',
      },
      {
        name: 'Arsenal no Ombro',
        action: 'Passiva',
        description:
          'Pode trocar entre revólver e facão como ação livre. A escopeta exige munição; após cada disparo, recarregar custa ação de movimento.',
      },
    ],
    intention: {
      name: 'Herança Final',
      action: 'Reação',
      cost: '3 PE',
      limit: '1/cena',
      description:
        'Ao chegar a 0 PV, aliados em alcance médio recuperam 3d8+8 PV e recebem +5 no próximo ataque. O último agressor em alcance curto sofre 3d10 impacto; Reflexos DT 22 reduz o dano à metade. Artur permanece morrendo.',
    },
  },
} as const satisfies Record<string, MaskedForm>;
