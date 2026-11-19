import { CharacterSheet } from './character.model';
import { neofitoRituals } from './combat/neofito-rituals';

/**
 * Texto único da intenção. O funcionamento permanece oculto: nada além desta
 * frase é revelado, e nenhum poder da VD 140 entra nas fichas.
 */
export const DORMANT_INTENTION =
  'Intenção Adormecida: poder próprio liberado apenas ao assumir a forma mascarada.';

/** Texto de apoio quando o ataque não registra condições ou efeitos especiais. */
export const NO_SPECIAL_EFFECTS = 'Sem condições ou efeitos especiais.';

/**
 * Nome da habilidade especial comum aos seis destinos. A ficha completa a
 * destaca separadamente das demais ações de combate.
 */
export const MASK_AWAKENING = 'Despertar a Máscara';

/** Classificação exibida na identificação de todas as fichas da versão atual. */
export const SHEET_IDENTITY = {
  type: 'Pessoa',
  category: 'Médio',
  grade: '80',
} as const;

/**
 * Fichas completas dos seis destinos, na versão VD 80.
 *
 * Os cinco atributos vivem na ficha pública (`dossier`) e são reaproveitados
 * pelo modal, preservando qualquer correção já feita diretamente no site.
 * As senhas continuam apenas em `characters.data.ts`.
 */
export const CHARACTER_SHEETS = {
  'anne-kent': {
    age: 'X',
    archetype: 'Berserker',
    defense: '24',
    fortitude: '4d20+10',
    reflexes: '1d20+5',
    will: '2d20+5',
    hitPoints: '160',
    wounded: '80',
    effortPoints: '8',
    speed: '9m',
    perception: '2d20+5',
    initiative: '1d20+5',
    skills: [
      { name: 'Atletismo', dice: '4d20', modifier: '+10' },
      { name: 'Fortitude', dice: '4d20', modifier: '+10' },
      { name: 'Intimidação', dice: '2d20', modifier: '+10' },
      { name: 'Luta', dice: '4d20', modifier: '+10' },
      { name: 'Percepção', dice: '2d20', modifier: '+5' },
      { name: 'Pilotagem', dice: '1d20', modifier: '+5' },
    ],
    actions: [
      {
        name: 'Pancada',
        range: 'Corpo a corpo',
        test: 'Luta 4d20+10',
        damage: '2d6+8',
        damageType: 'Impacto',
        critical: '20/x2',
      },
      {
        name: 'Combo de Punhos',
        action: 'Padrão',
        range: 'Corpo a corpo',
        damage: '1d6+5 (por ataque)',
        damageType: 'Impacto',
        description:
          'Faça dois ataques de punho. Cada ataque causa 1d6+5 impacto. Resolva cada ataque separadamente.',
      },
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
      },
    ],
    items: [],
    intention: DORMANT_INTENTION,
  },
  'david-moura': {
    age: 'X',
    archetype: 'Combatente',
    defense: '22',
    fortitude: '3d20+10',
    reflexes: '2d20+5',
    will: '2d20+5',
    hitPoints: '136',
    wounded: '68',
    effortPoints: '9',
    speed: '9m',
    perception: '2d20+5',
    initiative: '2d20+5',
    skills: [
      { name: 'Atletismo', dice: '4d20', modifier: '+10' },
      { name: 'Fortitude', dice: '3d20', modifier: '+10' },
      { name: 'Intimidação', dice: '2d20', modifier: '+5' },
      { name: 'Luta', dice: '4d20', modifier: '+15' },
      { name: 'Percepção', dice: '2d20', modifier: '+5' },
      { name: 'Reflexos', dice: '2d20', modifier: '+5' },
    ],
    actions: [
      {
        name: 'Facão de Corte',
        range: 'Corpo a corpo',
        test: 'Luta 4d20+15',
        damage: '2d8+10',
        damageType: 'Corte',
        critical: '19/x2',
      },
      {
        name: 'Abre-Guarda',
        action: 'Padrão',
        description:
          'Faça um ataque de facão. Se acertar, o alvo sofre -2 Defesa contra o próximo ataque recebido até o fim do próximo turno.',
      },
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
      },
    ],
    items: [{ name: 'Facão de Corte', type: 'Arma corpo a corpo' }],
    intention: DORMANT_INTENTION,
  },
  'lia-kwon': {
    age: 'X',
    archetype: 'Assassina',
    defense: '23',
    fortitude: '1d20+5',
    reflexes: '4d20+10',
    will: '2d20+5',
    hitPoints: '75',
    wounded: '37',
    effortPoints: '10',
    speed: '9m',
    perception: '2d20+5',
    initiative: '5d20+10',
    skills: [
      { name: 'Acrobacia', dice: '5d20', modifier: '+10' },
      { name: 'Crime', dice: '5d20', modifier: '+10' },
      { name: 'Furtividade', dice: '5d20', modifier: '+10' },
      { name: 'Luta', dice: '5d20', modifier: '+10' },
      { name: 'Percepção', dice: '2d20', modifier: '+5' },
      { name: 'Reflexos', dice: '5d20', modifier: '+10' },
    ],
    actions: [
      {
        name: 'Katana',
        range: 'Corpo a corpo',
        test: 'Luta 5d20+10',
        damage: '1d8+8',
        damageType: 'Corte',
        critical: '18/x3',
        description:
          'Cada acerto aplica 1 nível de Hemorragia (máximo 3). Hemorragia é contínua: causa 1d4 de dano por nível no início dos turnos do alvo.',
        mechanics: { kind: 'weapon', hemorrhageLevels: 1 },
      },
      {
        name: 'Shuriken de Tendão',
        range: 'Médio',
        test: 'Luta 5d20+10',
        damage: '1d4+5',
        damageType: 'Perfuração',
        critical: '19/x2',
        description:
          'Ao atingir a perna, Fortitude DT 20 evita a redução de 3 m no deslocamento até o fim do próximo turno. Rajada: 3 arremessos, cada um aplica 1 nível de Hemorragia (máximo 3).',
        mechanics: { kind: 'barrage', hemorrhageLevels: 1, throws: 3 },
      },
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
        mechanics: { kind: 'mask' },
      },
    ],
    items: [
      { name: 'Katana', type: 'Arma corpo a corpo' },
      { name: 'Shuriken de Tendão', type: 'Arma de arremesso' },
    ],
    intention: DORMANT_INTENTION,
  },
  'cecilia-nunes': {
    age: 'X',
    archetype: 'Atirador',
    defense: '21',
    fortitude: '3d20+5',
    reflexes: '3d20+10',
    will: '2d20+5',
    hitPoints: '100',
    wounded: '50',
    effortPoints: '8',
    speed: '9m',
    perception: '3d20+5',
    initiative: '2d20+5',
    skills: [
      { name: 'Pontaria', dice: '3d20', modifier: '+15' },
      { name: 'Percepção', dice: '3d20', modifier: '+10' },
      { name: 'Furtividade', dice: '3d20', modifier: '+5' },
      { name: 'Investigação', dice: '3d20', modifier: '+10' },
      { name: 'Reflexos', dice: '3d20', modifier: '+10' },
      { name: 'Sobrevivência', dice: '3d20', modifier: '+5' },
    ],
    actions: [
      {
        name: 'Fuzil de Precisão',
        range: 'Médio/longo',
        test: 'Pontaria 3d20+15',
        damage: '2d10+16',
        damageType: 'Balístico',
        critical: '18/x3',
        description: 'Após dois disparos, recarregar custa uma ação de movimento.',
      },
      {
        name: 'Restrição de Alcance',
        description:
          'O fuzil exige um alvo a pelo menos 9 m. Não pode ser disparado contra alvos adjacentes ou em alcance curto. Cecília não possui ataque corpo a corpo relevante; sua opção é recuar ou buscar cobertura.',
      },
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
      },
    ],
    items: [{ name: 'Fuzil de Precisão', type: 'Arma de fogo' }],
    intention: DORMANT_INTENTION,
  },
  neofito: {
    age: 'X',
    archetype: 'Ocultista',
    defense: '21',
    fortitude: '2d20+5',
    reflexes: '1d20+5',
    will: '3d20+10',
    hitPoints: '110',
    wounded: '55',
    effortPoints: '14',
    speed: '9m',
    perception: '3d20+5',
    initiative: '1d20+5',
    skills: [
      { name: 'Ciências', dice: '4d20', modifier: '+10' },
      { name: 'Investigação', dice: '4d20', modifier: '+10' },
      { name: 'Intuição', dice: '3d20', modifier: '+10' },
      { name: 'Medicina', dice: '4d20', modifier: '+5' },
      { name: 'Ocultismo', dice: '4d20', modifier: '+15' },
      { name: 'Vontade', dice: '3d20', modifier: '+10' },
    ],
    actions: [
      ...neofitoRituals('common'),
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
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
        mechanics: { kind: 'mask' },
      },
    ],
    items: [{ name: 'Bastão', type: 'Arma corpo a corpo' }],
    intention: DORMANT_INTENTION,
  },
  'artur-pires': {
    age: 'X',
    archetype: 'Sacrifício',
    defense: '22',
    fortitude: '2d20+5',
    reflexes: '2d20+5',
    will: '3d20+10',
    hitPoints: '120',
    wounded: '60',
    effortPoints: '10',
    speed: '9m',
    perception: '2d20+5',
    initiative: '2d20+5',
    skills: [
      { name: 'Investigação', dice: '3d20', modifier: '+10' },
      { name: 'Luta', dice: '2d20', modifier: '+10' },
      { name: 'Medicina', dice: '3d20', modifier: '+10' },
      { name: 'Percepção', dice: '2d20', modifier: '+5' },
      { name: 'Pontaria', dice: '2d20', modifier: '+10' },
      { name: 'Tecnologia', dice: '3d20', modifier: '+10' },
    ],
    actions: [
      {
        name: 'Disparador de Pregos',
        range: 'Médio',
        test: 'Pontaria 2d20+10',
        damage: '2d6+8',
        damageType: 'Perfuração',
        critical: '19/x2',
      },
      {
        name: 'Faca de Cozinha',
        range: 'Corpo a corpo',
        test: 'Luta 2d20+10',
        damage: '1d6+7',
        damageType: 'Corte',
        critical: '19/x2',
      },
      {
        name: 'Despertar a Máscara',
        action: 'Padrão',
        limit: 'Uma vez por cena',
        description: 'Não recupera PV ou PE. Não exige custo de recurso.',
      },
    ],
    items: [
      { name: 'Disparador de Pregos', type: 'Arma de fogo' },
      { name: 'Faca de Cozinha', type: 'Arma corpo a corpo' },
    ],
    intention: DORMANT_INTENTION,
  },
} as const satisfies Record<string, CharacterSheet>;
