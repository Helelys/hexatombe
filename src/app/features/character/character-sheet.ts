import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ATTRIBUTE_LABELS,
  Character,
  CharacterAbility,
  CharacterSheetAction,
} from '../../core/character/character.model';
import {
  MASK_AWAKENING,
  NO_SPECIAL_EFFECTS,
  SHEET_IDENTITY,
} from '../../core/character/character-sheets';
import { CharacterPortraitView } from './character-portrait';
import { LiaCombatConsole } from './combat/lia-combat-console';
import { NeofitoCombatConsole } from './combat/neofito-combat-console';

/** Tom visual de um movimento, derivado do tipo de ação. */
export type SheetTone = 'standard' | 'free' | 'reaction' | 'passive' | 'ritual' | 'neutral';

/** Forma exibida: a ficha comum (VD 80) ou a forma mascarada (VD 140). */
export type SheetForm = 'common' | 'masked';

const TONE_GLYPHS: Readonly<Record<SheetTone, string>> = {
  standard: '◆',
  free: '◇',
  reaction: '⟳',
  passive: '∞',
  ritual: '✶',
  neutral: '•',
};

/**
 * Classifica o tipo de ação para diferenciar ataques, ações livres, reações,
 * passivas e rituais. Acentos e caixa não importam.
 */
export function resolveSheetTone(action?: string): SheetTone {
  const label = (action ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (label.includes('passiv')) {
    return 'passive';
  }

  if (label.includes('reac')) {
    return 'reaction';
  }

  if (label.includes('livre')) {
    return 'free';
  }

  if (label.includes('ritual')) {
    return 'ritual';
  }

  if (label.includes('padr')) {
    return 'standard';
  }

  return 'neutral';
}

/** Natureza do card nas seções de ataques e habilidades. */
export type SheetCardKind = 'attack' | 'ritual' | 'combat' | 'condition';

const KIND_LABELS: Readonly<Record<SheetCardKind, string>> = {
  attack: 'Ataque',
  ritual: 'Ritual',
  combat: 'Habilidade de combate',
  condition: 'Condição',
};

/**
 * Classifica o card: ataque (teste e dano), ritual (círculo), habilidade de
 * combate ou condição de uso.
 */
export function resolveSheetCardKind(action: CharacterSheetAction): SheetCardKind {
  const category = (action.category ?? '').toLowerCase();

  if (category.includes('ritual')) {
    return 'ritual';
  }

  if (action.test && action.damage) {
    return 'attack';
  }

  return action.action ? 'combat' : 'condition';
}

/**
 * Habilidades seguem a mesma classificação das ações; apenas os rituais são
 * reconhecidos pelo círculo descrito no documento.
 */
export function resolveAbilityKind(ability: CharacterAbility): SheetCardKind {
  return (ability.category ?? '').toLowerCase().includes('ritual') ? 'ritual' : 'combat';
}

/** Par rótulo/valor das mecânicas de um card. */
interface SheetFact {
  readonly label: string;
  readonly value: string;
  readonly cost?: boolean;
  readonly damage?: boolean;
}

/** Card pronto para renderização nas áreas da ficha. */
interface SheetEntry {
  readonly name: string;
  readonly kind: SheetCardKind;
  readonly kindLabel: string;
  readonly tone: SheetTone;
  readonly glyph: string;
  readonly action?: string;
  readonly facts: readonly SheetFact[];
  readonly description: string;
}

function toFacts(action: CharacterSheetAction): readonly SheetFact[] {
  const facts: SheetFact[] = [];

  if (action.range) {
    facts.push({ label: 'Alcance', value: action.range });
  }

  if (action.test) {
    facts.push({ label: 'Teste', value: action.test });
  }

  if (action.damage) {
    facts.push({ label: 'Dano', value: action.damage, damage: true });
  }

  if (action.damageType) {
    facts.push({ label: 'Tipo', value: action.damageType });
  }

  if (action.critical) {
    facts.push({ label: 'Crítico', value: action.critical });
  }

  if (action.cost) {
    facts.push({ label: 'Custo', value: action.cost, cost: true });
  }

  if (action.limit) {
    facts.push({ label: 'Limite', value: action.limit });
  }

  return facts;
}

function toEntry(action: CharacterSheetAction, kind: SheetCardKind): SheetEntry {
  const tone = resolveSheetTone(action.action);

  return {
    name: action.name,
    kind,
    kindLabel: action.category ?? KIND_LABELS[kind],
    tone,
    glyph: TONE_GLYPHS[tone],
    action: action.action,
    facts: toFacts(action),
    description: action.description ?? NO_SPECIAL_EFFECTS,
  };
}

/**
 * Ficha completa em três áreas: identificação e informações gerais à esquerda,
 * atributos ao centro e, à direita, ataques, habilidades e intenção e itens —
 * nesta ordem —, com a intenção ao pé. Os atributos vêm da ficha pública,
 * preservando os valores já publicados.
 */
@Component({
  selector: 'app-character-sheet',
  imports: [CharacterPortraitView, LiaCombatConsole, NeofitoCombatConsole],
  templateUrl: './character-sheet.html',
  styleUrl: './character-sheet.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mood]': 'character().theme.mood',
    '[attr.data-emblem]': 'dossier()?.emblem ?? null',
    '[attr.data-form]': 'form()',
  },
})
export class CharacterSheetView {
  readonly character = input.required<Character>();
  /** `masked` troca a ficha comum (VD 80) pela forma mascarada (VD 140). */
  readonly form = input<SheetForm>('common');

  /** Forma mascarada em exibição; nula enquanto a ficha comum está aberta. */
  protected readonly masked = computed(() =>
    this.form() === 'masked' ? (this.character().maskedForm ?? null) : null,
  );

  protected readonly data = computed(() =>
    this.form() === 'masked'
      ? (this.character().maskedForm?.sheet ?? null)
      : (this.character().sheet ?? null),
  );

  protected readonly dossier = computed(() => this.character().dossier ?? null);
  protected readonly portrait = computed(() => this.dossier()?.portrait ?? null);

  /**
   * Mesa de combate automatizada: só a Lia (Hemorragia) e o Neófito (sacrifício
   * de sangue) têm regras implementadas. Os demais personagens não exibem painel.
   */
  protected readonly combatMode = computed<'lia' | 'neofito' | null>(() => {
    switch (this.character().slug) {
      case 'lia-kwon':
        return 'lia';
      case 'neofito':
        return 'neofito';
      default:
        return null;
    }
  });

  /** VD da forma em exibição: 80 na ficha comum, 140 na forma mascarada. */
  protected readonly grade = computed(() => this.masked()?.grade ?? SHEET_IDENTITY.grade);

  /** Tipo, categoria, arquétipo, VD, idade e máscara exibidos sob o nome. */
  protected readonly identityMeta = computed(() => {
    const sheet = this.data();
    const mask = this.masked();
    const meta = [
      { key: 'type', label: 'Tipo', value: SHEET_IDENTITY.type },
      { key: 'category', label: 'Categoria', value: SHEET_IDENTITY.category },
      { key: 'archetype', label: 'Arquétipo', value: sheet?.archetype ?? '' },
      { key: 'grade', label: 'VD', value: this.grade() },
      { key: 'age', label: 'Idade', value: sheet?.age ?? '' },
    ];

    return mask ? [...meta, { key: 'mask', label: 'Máscara', value: mask.name }] : meta;
  });

  /**
   * Os cinco atributos da forma em exibição. Na ficha comum vêm da ficha
   * pública, preservando os valores já publicados no site.
   */
  protected readonly attributes = computed(() => {
    const source = this.masked()?.attributes ?? this.dossier()?.attributes ?? [];

    return source.map((attribute) => ({
      ...attribute,
      label: ATTRIBUTE_LABELS[attribute.key],
    }));
  });

  protected readonly skills = computed(() => this.data()?.skills ?? []);

  protected readonly senses = computed(() => {
    const sheet = this.data();

    if (!sheet) {
      return [];
    }

    return [
      { key: 'perception', label: 'Percepção', value: sheet.perception },
      { key: 'initiative', label: 'Iniciativa', value: sheet.initiative },
    ];
  });

  protected readonly defense = computed(() => this.data()?.defense ?? '');

  protected readonly resistances = computed(() => {
    const sheet = this.data();

    if (!sheet) {
      return [];
    }

    return [
      { key: 'fortitude', label: 'Fortitude', value: sheet.fortitude },
      { key: 'reflexes', label: 'Reflexos', value: sheet.reflexes },
      { key: 'will', label: 'Vontade', value: sheet.will },
    ];
  });

  protected readonly vitality = computed(() => {
    const sheet = this.data();

    if (!sheet) {
      return [];
    }

    return [
      { key: 'hitPoints', label: 'PV', value: sheet.hitPoints },
      { key: 'wounded', label: 'Machucado', value: sheet.wounded },
    ];
  });

  protected readonly effortPoints = computed(() => this.data()?.effortPoints ?? '');
  protected readonly speed = computed(() => this.data()?.speed ?? '');

  /** Habilidades da forma em exibição. */
  private readonly abilities = computed(() =>
    this.form() === 'masked' ? (this.masked()?.abilities ?? []) : (this.dossier()?.abilities ?? []),
  );

  /**
   * Destaque da ficha: na forma comum é o Despertar a Máscara; na forma
   * mascarada é o poder de intenção liberado pela transformação.
   */
  protected readonly specialAbility = computed(() => {
    const intention = this.masked()?.intention;

    if (intention) {
      return toEntry(intention, resolveAbilityKind(intention));
    }

    const special = this.data()?.actions.find((action) => action.name === MASK_AWAKENING);

    return special ? toEntry(special, 'combat') : null;
  });

  protected readonly specialTitle = computed(() =>
    this.masked() ? 'Poder de intenção' : 'Habilidade especial',
  );

  /** O pé da ficha nomeia a intenção, ou as regras da transformação. */
  protected readonly intentLabel = computed(() => (this.masked() ? 'Transformação' : 'Intenção'));

  /**
   * Seção Ataques: golpes, rituais usados como ação ofensiva e condições de uso
   * registradas na ficha. Rituais vindos das habilidades entram aqui, pois são
   * ações de ataque; passivas e reações ficam na seção seguinte.
   */
  protected readonly attacks = computed<readonly SheetEntry[]>(() => [
    ...(this.data()?.actions ?? [])
      .filter((action) => action.name !== MASK_AWAKENING)
      .map((action) => toEntry(action, resolveSheetCardKind(action))),
    ...this.abilities()
      .filter((ability) => resolveAbilityKind(ability) === 'ritual')
      .map((ability) => toEntry(ability, 'ritual')),
  ]);

  /** Seção Habilidades e intenção: passivas, reações e efeitos especiais. */
  protected readonly abilityEntries = computed<readonly SheetEntry[]>(() =>
    this.abilities()
      .filter((ability) => resolveAbilityKind(ability) !== 'ritual')
      .map((ability) => toEntry(ability, 'combat')),
  );

  /** Seção Itens: equipamento carregado, sem repetir os ataques. */
  protected readonly items = computed(() => this.data()?.items ?? []);

  /** Identificadores únicos por personagem, para os títulos de cada bloco. */
  protected sectionId(section: string): string {
    return `sheet-${this.character().slug}-${section}`;
  }
}
