import { MaskedForm } from './character.model';
import { neofitoRituals } from './combat/neofito-rituals';

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
      archetype: 'Berserker',
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
          name: 'Punhos de Fúria',
          range: 'Corpo a corpo',
          test: 'Luta 5d20+15',
          damage: '4d6+18',
          damageType: 'Impacto',
          critical: '20/x2',
        },
        {
          name: 'Sequência Demolidora',
          action: 'Padrão',
          range: 'Corpo a corpo',
          damage: '1d8+8 (por ataque)',
          damageType: 'Impacto',
          description:
            'Faça três ataques de punho. Cada ataque causa 1d8+8 impacto. Resolva cada ataque separadamente.',
        },
      ],
      items: [],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'RD de Monstro',
        action: 'Passiva',
        description: 'Anne recebe RD 10 contra dano físico.',
      },
      {
        name: 'Fúria Retaliatória',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Ao sofrer dano corpo a corpo, reduz o dano em 2d10+8. O agressor faz Fortitude DT 23 ou é empurrado 3 m e fica caído.',
      },
      {
        name: 'Carga Imparável',
        action: 'Padrão',
        limit: '1/rodada',
        description:
          'Avança até 6 m em linha reta e faz um ataque de punho contra cada inimigo no caminho. Cada ataque causa 1d8+8 impacto. Fortitude DT 23 evita ser derrubado.',
      },
    ],
    intention: {
      name: 'Fúria Inabalável',
      action: 'Livre',
      limit: '1/cena',
      description:
        'Por 2 rodadas, Anne recebe RD 15, substituindo sua RD 10. Uma vez por turno, ao acertar com os punhos, faz um ataque adicional de 1d8+8 impacto.',
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
      archetype: 'Combatente',
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
          range: 'Corpo a corpo',
          damage: '+2d8',
          description: 'Ataque corpo a corpo. Ignora 5 pontos de resistência a dano do alvo.',
        },
      ],
      items: [{ name: 'Facão Gume', type: 'Arma corpo a corpo' }],
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
          'Quando reduz um alvo a 0 PV, pode se deslocar 3 m e recebe +2 no próximo teste de ataque até o fim do próximo turno.',
      },
      {
        name: 'Fôlego de Guerra',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Ao sofrer dano, recebe +5 em Fortitude até o início do próximo turno.',
      },
    ],
    intention: {
      name: 'Corte de Sentença',
      action: 'Padrão',
      limit: '1/cena',
      description:
        'Marca um alvo visível. O próximo ataque corpo a corpo que acertar o alvo em até 2 rodadas causa +5d8. Se o alvo estiver abaixo da metade dos PV, causa +2d8 adicionais.',
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
      archetype: 'Assassina',
      defense: '29',
      fortitude: '2d20+10',
      reflexes: '5d20+15',
      will: '2d20+10',
      hitPoints: '130',
      wounded: '65',
      effortPoints: '13',
      speed: '12m',
      perception: '2d20+10',
      initiative: '5d20+15',
      skills: [
        { name: 'Acrobacia', dice: '5d20', modifier: '+15' },
        { name: 'Crime', dice: '5d20', modifier: '+15' },
        { name: 'Furtividade', dice: '5d20', modifier: '+15' },
        { name: 'Luta', dice: '5d20', modifier: '+15' },
        { name: 'Percepção', dice: '2d20', modifier: '+10' },
        { name: 'Reflexos', dice: '5d20', modifier: '+15' },
      ],
      actions: [
        {
          name: 'Katana do Risco',
          range: 'Corpo a corpo',
          test: 'Luta 5d20+15',
          damage: '4d6+12',
          damageType: 'Corte',
          critical: '17/x3',
          description:
            'Cada acerto aplica 1 nível de Hemorragia (máximo 3). Hemorragia é contínua: causa 1d4 de dano por nível no início dos turnos do alvo.',
          mechanics: { kind: 'weapon', hemorrhageLevels: 1 },
        },
        {
          name: 'Shuriken de Tendão',
          range: 'Médio',
          test: 'Luta 5d20+15',
          damage: '1d6+8',
          damageType: 'Perfuração',
          critical: '19/x2',
          description:
            'Ao atingir a perna, Fortitude DT 23 evita a redução de 6 m no deslocamento até o fim do próximo turno. Rajada: 3 arremessos, cada um aplica 1 nível de Hemorragia (máximo 3).',
          mechanics: { kind: 'barrage', hemorrhageLevels: 1, throws: 3 },
        },
      ],
      items: [
        { name: 'Katana do Risco', type: 'Arma corpo a corpo' },
        { name: 'Shuriken de Tendão', type: 'Arma de arremesso' },
      ],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Dança Sangrenta',
        action: 'Livre',
        limit: '1/rodada',
        description:
          'Depois do segundo acerto contra o mesmo alvo no mesmo turno, o ataque recebe +4d6 de dano de corte. Não pode ser ativada mais de uma vez por turno.',
      },
      {
        name: 'Feridas Abertas',
        action: 'Passiva',
        description:
          'Cada nível de Hemorragia do alvo adiciona +1d4 ao dano dos ataques da Lia. Hemorragia continua causando 1d4 de dano por nível no início dos turnos do alvo, até o máximo de 3 níveis.',
      },
      {
        name: 'Instinto Assassino',
        action: 'Passiva',
        description:
          'Contra alvos sangrando, os ataques recebem +2d6; contra alvos com 3 níveis de Hemorragia, o bônus sobe para +4d6.',
      },
    ],
    intention: {
      name: 'Abate Perfeito',
      action: 'Padrão',
      limit: '1/cena',
      description:
        'Realiza 3 ataques alternados entre Katana do Risco e Shuriken de Tendão. No fim, consome todos os níveis de Hemorragia do alvo e causa 3d8 de dano adicional por nível consumido.',
      mechanics: { kind: 'execution', attacks: 3, hemorrhageDamagePerLevel: '3d8' },
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
      archetype: 'Atirador',
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
            'O fuzil exige um alvo a pelo menos 9 m. Não dispara contra alvos adjacentes ou em alcance curto. Sem ataque corpo a corpo relevante; precisa recuar ou usar cobertura.',
        },
      ],
      items: [{ name: 'Fuzil Vigília', type: 'Arma de fogo' }],
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
        name: 'Tiro Perfurante',
        action: 'Padrão',
        limit: '1/rodada',
        description: 'O disparo ignora 10 pontos de resistência a dano do alvo.',
      },
      {
        name: 'Linha de Execução',
        action: 'Padrão',
        description:
          'Se tiver mirado no turno anterior, o disparo causa +2d10. Contra alvo abaixo da metade dos PV, causa +2d10 adicionais.',
      },
    ],
    intention: {
      name: 'Ângulo Impossível',
      action: 'Padrão',
      limit: '1/cena',
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
      archetype: 'Ocultista',
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
        ...neofitoRituals('masked'),
        {
          name: 'Golpe de Bastão',
          range: 'Corpo a corpo',
          test: 'Luta 1d20',
          damage: '1d8+5',
          damageType: 'Impacto',
          critical: '20/x2',
          description:
            'Arma física secundária. O bastão não extrai sangue, não aplica marcas e não substitui os rituais.',
        },
      ],
      items: [{ name: 'Bastão', type: 'Arma corpo a corpo' }],
      intention: MASKED_FORM_NOTE,
    },
    abilities: [
      {
        name: 'Oferenda de Sangue',
        action: 'Livre',
        description:
          'Sacrifica PV reais para potencializar o próximo ritual de dano ou cura. Custo em PV e bônus em dados dependem da ficha final aprovada e são configurados na mesa de combate. Nunca consome PV temporários.',
        mechanics: { kind: 'support', support: 'offering' },
      },
      {
        name: 'Prece de Ferida',
        action: 'Livre',
        description:
          'Sacrifício curto em PV reais que prepara o próximo ritual. O custo e o bônus são definidos na ficha final aprovada e configurados na mesa de combate. Se o PV real chegar a zero, o bônus fica pendente.',
        mechanics: { kind: 'support', support: 'rite' },
      },
    ],
    intention: {
      name: 'Cartografia Carmesim',
      action: 'Padrão',
      limit: '1/cena',
      description:
        'Atinge todos os inimigos marcados: consome todas as marcas, causa dano de Sangue, converte a cura em PV temporários e deixa os alvos enfraquecidos por algumas rodadas. Exige sacrifício em PV reais e conclui mesmo que o sacrifício leve o PV a zero. Dano, sacrifício, cura e duração dependem da ficha final aprovada e são configurados na mesa de combate.',
      mechanics: { kind: 'cartography' },
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
      archetype: 'Sacrifício',
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
          name: 'Disparador de Pregos Modificado',
          range: 'Médio',
          test: 'Pontaria 3d20+15',
          damage: '3d8+12',
          damageType: 'Perfuração',
          critical: '19/x2',
        },
        {
          name: 'Faca de Cozinha',
          range: 'Corpo a corpo',
          test: 'Luta 3d20+15',
          damage: '2d6+10',
          damageType: 'Corte',
          critical: '19/x2',
        },
        {
          name: 'Salva de Pregos',
          action: 'Padrão',
          range: 'Médio',
          damage: '2d6+8 (por ataque)',
          damageType: 'Perfuração',
          description:
            'Faça dois ataques com o disparador. Cada ataque causa 2d6+8 perfuração. Podem atingir o mesmo alvo ou alvos diferentes.',
        },
      ],
      items: [
        { name: 'Disparador de Pregos Modificado', type: 'Arma de fogo' },
        { name: 'Faca de Cozinha', type: 'Arma corpo a corpo' },
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
          'Pode trocar entre o disparador de pregos e a faca de cozinha como ação livre.',
      },
    ],
    intention: {
      name: 'Ponto de Fixação',
      action: 'Padrão',
      limit: '1/cena',
      description:
        'Faça um ataque com o disparador de pregos. Se acertar, causa +4d8 perfuração. Fortitude DT 22 evita que o deslocamento do alvo seja reduzido para 3 m até o fim do próximo turno.',
    },
  },
} as const satisfies Record<string, MaskedForm>;
