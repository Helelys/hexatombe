import { computed, signal, WritableSignal } from '@angular/core';
import { Character, CharacterAbility, CharacterSheet, CharacterSheetAction, RitualMechanicKind } from '../character.model';
import { CombatLogEntry, CombatLogTone } from './combat-log';
import { RandomSource, describeRoll, parseDiceExpression, rollExpression } from './combat-dice';
import { CombatForm } from './combat-form';

export const MAX_MARKS = 3;

export type NeofitoSpecialId = 'offering' | 'rite';

/** Nomes das duas habilidades especiais, iguais nas duas formas. */
export const NEOFITO_SPECIAL_NAMES: Record<NeofitoSpecialId, string> = {
  offering: 'Oferenda de Sangue',
  rite: 'Prece de Ferida',
};

export interface NeofitoEnemy {
  readonly id: string;
  readonly name: string;
  /** Marcas de sangue, de 0 a 3. */
  readonly marks: number;
}

export interface PendingBonus {
  readonly source: string;
  /** Bônus fixo, em pontos de dano ou cura. */
  readonly amount?: number;
  /** Bônus em dados, como `2d8`. */
  readonly dice?: string;
}

export interface NeofitoSpecialSettings {
  readonly cost: number | null;
  readonly bonus: string | null;
}

export interface RitualEffectSettings {
  readonly damage: string | null;
  readonly heal: string | null;
  readonly rounds: number | null;
}

export interface CartographySettings {
  readonly damage: string | null;
  readonly sacrifice: number | null;
  readonly heal: string | null;
  readonly weakenedRounds: number | null;
}

/**
 * Valores que a ficha final aprovada ainda não fechou. A mesa os informa uma
 * vez e o painel calcula custo progressivo, dano, cura, absorção e bônus.
 */
export interface NeofitoSettings {
  readonly markCost: number | null;
  readonly ritualEffects: Record<string, RitualEffectSettings>;
  readonly cartography: CartographySettings;
  readonly specials: Record<NeofitoSpecialId, NeofitoSpecialSettings>;
}

export type HemofagiaChoice = 'absorb' | 'empower';

export interface CastRitualOptions {
  /** Alvos marcados escolhidos; ausente significa todos os marcados. */
  readonly targets?: readonly string[];
  readonly choice?: HemofagiaChoice;
}

export interface NeofitoResult {
  readonly ok: boolean;
  readonly message: string;
  readonly ritual?: string;
  readonly cost?: number;
  readonly damage?: number;
  readonly healing?: number;
  readonly tempHitPoints?: number;
  readonly marksConsumed?: number;
  readonly choice?: HemofagiaChoice;
  readonly potentiation?: number;
  readonly weakenedRounds?: number;
  readonly sacrificed?: number;
}

export interface NeofitoDamageResult {
  readonly ok: boolean;
  readonly message: string;
  readonly absorbed: number;
  readonly realDamage: number;
}

/** Configuração inicial: só a Hemofagia já traz números fechados na ficha. */
export function createNeofitoSettings(rituals: readonly CharacterSheetAction[]): NeofitoSettings {
  const ritualEffects: Record<string, RitualEffectSettings> = {};

  for (const ritual of rituals) {
    if (ritual.mechanics?.kind !== 'ritual') {
      continue;
    }

    ritualEffects[ritual.name] = { damage: null, heal: null, rounds: null };
  }

  return {
    markCost: null,
    ritualEffects,
    cartography: { damage: null, sacrifice: null, heal: null, weakenedRounds: null },
    specials: {
      offering: { cost: null, bonus: null },
      rite: { cost: null, bonus: null },
    },
  };
}

export function isRitualConfigured(ritual: CharacterSheetAction, settings: NeofitoSettings): boolean {
  if (ritual.mechanics?.kind === 'hemofagia') {
    return parseDiceExpression(ritual.damage) !== null;
  }

  const effect = settings.ritualEffects[ritual.name];
  if (!effect) {
    return false;
  }

  switch (ritual.mechanics?.ritualKind) {
    case 'damage':
      return parseDiceExpression(effect.damage ?? undefined) !== null;
    case 'heal':
      return parseDiceExpression(effect.heal ?? undefined) !== null;
    case 'control':
      return (effect.rounds ?? 0) > 0;
    case 'hybrid':
      return (
        parseDiceExpression(effect.damage ?? undefined) !== null &&
        parseDiceExpression(effect.heal ?? undefined) !== null
      );
    default:
      return false;
  }
}

export function isSpecialConfigured(id: NeofitoSpecialId, settings: NeofitoSettings): boolean {
  const special = settings.specials[id];
  return (
    special.cost !== null &&
    special.cost >= 1 &&
    parseDiceExpression(special.bonus ?? undefined) !== null
  );
}

export function isCartographyConfigured(settings: NeofitoSettings): boolean {
  const cartography = settings.cartography;
  return (
    parseDiceExpression(cartography.damage ?? undefined) !== null &&
    cartography.sacrifice !== null &&
    cartography.sacrifice >= 1 &&
    parseDiceExpression(cartography.heal ?? undefined) !== null &&
    (cartography.weakenedRounds ?? 0) > 0
  );
}

/**
 * Mesa de combate do Neófito.
 *
 * Todos os rituais consomem PV reais (nunca temporários). O custo é
 * progressivo dentro do turno: 1 PV no primeiro ritual, 2 no segundo, 3 no
 * terceiro, e volta a 1 quando o turno termina. A Hemofagia exige alvos
 * marcados, consome as marcas e converte 50% do dano em PV temporários
 * (Absorção) ou em bônus para o próximo ritual (Potencialização).
 *
 * Os números que a ficha final ainda não fixou ficam em `settings` e precisam
 * ser informados na mesa antes de conjurar.
 */
export class NeofitoCombat {
  readonly form: CombatForm;
  readonly sheet: CharacterSheet;
  readonly maxHitPoints: number;
  readonly rituals: readonly CharacterSheetAction[];
  readonly cartography: CharacterAbility | undefined;
  readonly specials: Partial<Record<NeofitoSpecialId, CharacterAbility>>;

  readonly hitPoints: WritableSignal<number>;
  readonly tempHitPoints = signal(0);
  readonly pendingBonuses = signal<readonly PendingBonus[]>([]);
  readonly settings: WritableSignal<NeofitoSettings>;
  readonly enemies = signal<readonly NeofitoEnemy[]>([]);
  readonly log = signal<readonly CombatLogEntry[]>([]);
  readonly round = signal(1);
  readonly ritualsThisTurn = signal(0);
  readonly sceneUsed = signal(false);

  private readonly random: RandomSource;
  private logId = 0;
  private enemyId = 0;

  constructor(character: Character, form: CombatForm = 'common', random: RandomSource = Math.random) {
    this.form = form;
    this.random = random;

    const sheet = form === 'masked' ? character.maskedForm?.sheet : character.sheet;
    this.sheet = sheet ?? (character.sheet as CharacterSheet);
    this.maxHitPoints = Number(this.sheet?.hitPoints) || 0;
    this.hitPoints = signal(this.maxHitPoints);

    this.rituals = (this.sheet?.actions ?? []).filter(
      (action) => action.mechanics?.kind === 'ritual' || action.mechanics?.kind === 'hemofagia',
    );
    this.settings = signal(createNeofitoSettings(this.rituals));

    this.cartography = form === 'masked' ? character.maskedForm?.intention : undefined;

    const specials: Partial<Record<NeofitoSpecialId, CharacterAbility>> = {};
    const abilities = [
      ...(character.dossier?.abilities ?? []),
      ...(character.maskedForm?.abilities ?? []),
    ];
    for (const ability of abilities) {
      const id = ability.mechanics?.support;
      if (id && !specials[id]) {
        specials[id] = ability;
      }
    }
    this.specials = specials;
  }

  readonly totalHitPoints = computed(() => this.hitPoints() + this.tempHitPoints());
  readonly markedEnemies = computed(() => this.enemies().filter((enemy) => enemy.marks > 0));

  get ritualLimit(): number {
    return this.form === 'masked' ? Number.POSITIVE_INFINITY : 2;
  }

  get ritualLimitLabel(): string {
    return this.form === 'masked' ? 'Sem limite por turno' : '2 rituais por turno';
  }

  /** Custo do próximo ritual no turno atual (1, 2, 3...). */
  nextRitualCost(): number {
    return this.ritualsThisTurn() + 1;
  }

  ritualReady(ritual: CharacterSheetAction): boolean {
    return isRitualConfigured(ritual, this.settings());
  }

  specialReady(id: NeofitoSpecialId): boolean {
    return isSpecialConfigured(id, this.settings());
  }

  get cartographyReady(): boolean {
    return this.form === 'masked' && isCartographyConfigured(this.settings());
  }

  canCast(ritual: CharacterSheetAction): boolean {
    if (this.hitPoints() <= 0) {
      return false;
    }
    if (this.ritualsThisTurn() >= this.ritualLimit) {
      return false;
    }
    if (!this.ritualReady(ritual)) {
      return false;
    }
    if (ritual.mechanics?.kind === 'hemofagia' && this.markedEnemies().length === 0) {
      return false;
    }

    return true;
  }

  updateSettings(updater: (settings: NeofitoSettings) => NeofitoSettings): void {
    this.settings.update(updater);
  }

  addEnemy(name: string): NeofitoEnemy | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    this.enemyId += 1;
    const enemy: NeofitoEnemy = { id: `neo-enemy-${this.enemyId}`, name: trimmed, marks: 0 };
    this.enemies.update((enemies) => [...enemies, enemy]);
    this.pushLog('Alvo registrado', [`${enemy.name} entrou no combate.`], 'system');
    return enemy;
  }

  removeEnemy(id: string): void {
    const enemy = this.findEnemy(id);
    if (!enemy) {
      return;
    }

    this.enemies.update((enemies) => enemies.filter((entry) => entry.id !== id));
    this.pushLog('Alvo removido', [`${enemy.name} saiu do combate.`], 'system');
  }

  /**
   * Aplica uma marca sacrificando PV reais. PV temporários nunca pagam o custo.
   * O teto é de 3 marcas por alvo.
   */
  applyMark(enemyId: string): NeofitoResult {
    const enemy = this.findEnemy(enemyId);
    if (!enemy) {
      return this.fail('Escolha um alvo para receber a marca.');
    }

    if (enemy.marks >= MAX_MARKS) {
      return this.fail(`${enemy.name} já tem 3 marcas (máximo por alvo).`);
    }

    const configuredCost = this.settings().markCost;
    if (configuredCost === null || configuredCost < 1) {
      return this.fail('Defina na configuração o custo em PV de cada marca.');
    }

    if (this.hitPoints() <= 0) {
      return this.fail('PV em zero: não é possível sacrificar PV para marcar um alvo.');
    }

    const before = this.hitPoints();
    const paid = Math.min(before, configuredCost);
    this.hitPoints.set(before - paid);
    this.setMarks(enemy.id, enemy.marks + 1);

    const current = enemy.marks + 1;
    const lines = [
      `${enemy.name}: marca ${current}/${MAX_MARKS}.`,
      `Sacrifício: ${paid} PV reais${paid < configuredCost ? ' (todo o PV restante)' : ''}.`,
    ];
    if (this.hitPoints() === 0) {
      lines.push('PV reais chegaram a zero com a marca aplicada.');
    }
    this.pushLog('Marca de Sangue', lines, 'blood');

    return {
      ok: true,
      message: `Marca aplicada em ${enemy.name} (${current}/3) por ${paid} PV.`,
      cost: paid,
      sacrificed: paid,
    };
  }

  /** Remoção manual, para corrigir a mesa; a Hemofagia também consome marcas. */
  removeMark(enemyId: string): void {
    const enemy = this.findEnemy(enemyId);
    if (!enemy || enemy.marks <= 0) {
      return;
    }

    this.setMarks(enemy.id, enemy.marks - 1);
    this.pushLog('Marca de Sangue', [`${enemy.name}: marca removida — agora ${enemy.marks - 1}/3.`], 'system');
  }

  /** Dano recebido: PV temporários absorvem primeiro; o restante vai ao PV real. */
  applyDamage(amount: number): NeofitoDamageResult {
    const damage = Math.floor(amount);
    if (!Number.isFinite(damage) || damage <= 0) {
      return { ok: false, message: 'Informe um dano maior que zero.', absorbed: 0, realDamage: 0 };
    }

    const temp = this.tempHitPoints();
    const absorbed = Math.min(temp, damage);
    const realDamage = damage - absorbed;

    this.tempHitPoints.set(temp - absorbed);
    if (realDamage > 0) {
      this.hitPoints.update((hitPoints) => Math.max(0, hitPoints - realDamage));
    }

    this.pushLog(
      'Dano recebido',
      [
        `Dano: ${damage}.`,
        `PV temporários absorvidos: ${absorbed}.`,
        `PV reais perdidos: ${realDamage}.`,
        `PV: ${this.hitPoints()} real(is) + ${this.tempHitPoints()} temporário(s).`,
      ],
      'damage',
    );

    return {
      ok: true,
      message: `${damage} de dano: ${absorbed} absorvido(s) por PV temporários, ${realDamage} em PV reais.`,
      absorbed,
      realDamage,
    };
  }

  /**
   * Conjura um ritual. O sacrifício é pago antes da resolução e usa apenas PV
   * reais; se o custo exceder o PV atual, todo o PV restante é sacrificado e o
   * ritual ainda é concluído.
   */
  castRitual(name: string, options: CastRitualOptions = {}): NeofitoResult {
    const ritual = this.rituals.find((entry) => entry.name === name);
    if (!ritual) {
      return this.fail('Ritual não encontrado nesta forma.');
    }

    if (this.hitPoints() <= 0) {
      return this.fail('PV em zero: restaure PV antes de conjurar outro ritual.');
    }

    if (this.ritualsThisTurn() >= this.ritualLimit) {
      return this.fail('Limite de 2 rituais por turno atingido.');
    }

    const kind = ritual.mechanics?.kind ?? 'ritual';
    let targets: NeofitoEnemy[] = [];

    if (kind === 'hemofagia') {
      targets =
        options.targets === undefined
          ? [...this.markedEnemies()]
          : options.targets
              .map((id) => this.findEnemy(id))
              .filter((enemy): enemy is NeofitoEnemy => !!enemy && enemy.marks > 0);

      if (!targets.length) {
        return this.fail('Hemofagia exige ao menos um alvo marcado.');
      }
      if (!options.choice) {
        return this.fail('Escolha entre Absorção e Potencialização antes de conjurar a Hemofagia.');
      }
    } else if (!this.ritualReady(ritual)) {
      return this.fail(`${ritual.name}: defina os valores na configuração antes de conjurar.`);
    }

    const effect = this.settings().ritualEffects[ritual.name];
    const cost = this.nextRitualCost();
    const before = this.hitPoints();
    const paid = Math.min(before, cost);
    this.hitPoints.set(before - paid);
    this.ritualsThisTurn.update((count) => count + 1);

    const lines = [`Sacrifício: ${paid} PV reais (custo ${cost} no turno).`];
    if (paid < cost) {
      lines.push('PV insuficiente: todo o PV restante foi sacrificado.');
    }
    if (this.hitPoints() === 0) {
      lines.push('PV reais em zero: o ritual ainda é concluído.');
    }

    if (kind === 'hemofagia') {
      let damage = 0;
      let marksConsumed = 0;

      for (const enemy of targets) {
        const roll = rollExpression(ritual.damage, this.random);
        if (!roll) {
          continue;
        }

        damage += roll.total;
        marksConsumed += enemy.marks;
        lines.push(`${enemy.name}: ${describeRoll(roll)} de dano (${enemy.marks} marca(s) consumida(s)).`);
        this.setMarks(enemy.id, 0);
      }

      const pending = this.takePending();
      damage += pending.total;
      lines.push(...pending.lines);

      let temp = 0;
      let potentiation = 0;
      if (options.choice === 'absorb') {
        temp = Math.floor(damage / 2);
        this.tempHitPoints.update((value) => value + temp);
        lines.push(`Absorção: ${temp} PV temporários (50% de ${damage}).`);
      } else {
        potentiation = Math.floor(damage / 2);
        this.pendingBonuses.update((list) => [
          ...list,
          { source: 'Potencialização (Hemofagia)', amount: potentiation },
        ]);
        lines.push(`Potencialização: +${potentiation} de dano no próximo ritual.`);
      }

      lines.push(`Dano total: ${damage}. Marcas consumidas: ${marksConsumed}.`);
      this.pushLog('Hemofagia', lines, 'ritual');

      return {
        ok: true,
        message: `Hemofagia: ${damage} de dano em ${targets.length} alvo(s), ${marksConsumed} marca(s) consumida(s).`,
        ritual: ritual.name,
        cost: paid,
        damage,
        tempHitPoints: temp,
        marksConsumed,
        choice: options.choice,
        potentiation,
      };
    }

    const resolved = this.resolveRitualEffect(ritual.mechanics?.ritualKind, effect, lines);
    this.pushLog(`Ritual — ${ritual.name}`, lines, 'ritual');

    return {
      ok: true,
      message: `${ritual.name} concluído com ${paid} PV sacrificados.`,
      ritual: ritual.name,
      cost: paid,
      damage: resolved.damage,
      healing: resolved.healing,
      tempHitPoints: resolved.temp,
      weakenedRounds: resolved.weakenedRounds,
    };
  }

  private resolveRitualEffect(
    kind: RitualMechanicKind | undefined,
    effect: RitualEffectSettings | undefined,
    lines: string[],
  ): { damage: number; healing: number; temp: number; weakenedRounds: number } {
    let damage = 0;
    let healing = 0;
    let temp = 0;
    let weakenedRounds = 0;

    switch (kind) {
      case 'damage': {
        const roll = rollExpression(effect?.damage ?? undefined, this.random);
        damage = roll?.total ?? 0;
        if (roll) {
          lines.push(`Dano: ${describeRoll(roll)}.`);
        }
        const pending = this.takePending();
        damage += pending.total;
        lines.push(...pending.lines, `Dano total: ${damage}.`);
        break;
      }
      case 'heal': {
        const roll = rollExpression(effect?.heal ?? undefined, this.random);
        healing = roll?.total ?? 0;
        if (roll) {
          lines.push(`Cura: ${describeRoll(roll)}.`);
        }
        const pending = this.takePending();
        healing += pending.total;
        lines.push(...pending.lines);
        temp = healing;
        this.tempHitPoints.update((value) => value + healing);
        lines.push(`Cura recebida como PV temporários: +${healing} (total ${this.tempHitPoints()}).`);
        break;
      }
      case 'control': {
        weakenedRounds = effect?.rounds ?? 0;
        lines.push(`Controle: condição por ${weakenedRounds} rodada(s).`);
        if (this.pendingBonuses().length) {
          lines.push(
            'Potencialização mantida para o próximo ritual com dano ou cura (controle não recebe bônus numérico).',
          );
        }
        break;
      }
      case 'hybrid': {
        const damageRoll = rollExpression(effect?.damage ?? undefined, this.random);
        damage = damageRoll?.total ?? 0;
        if (damageRoll) {
          lines.push(`Dano: ${describeRoll(damageRoll)}.`);
        }
        const pending = this.takePending();
        damage += pending.total;
        lines.push(...pending.lines, `Dano total: ${damage}.`);

        const healRoll = rollExpression(effect?.heal ?? undefined, this.random);
        healing = healRoll?.total ?? 0;
        if (healRoll) {
          lines.push(`Cura: ${describeRoll(healRoll)}.`);
        }
        temp = healing;
        this.tempHitPoints.update((value) => value + healing);
        lines.push(`Cura recebida como PV temporários: +${healing} (total ${this.tempHitPoints()}).`);
        break;
      }
      default:
        break;
    }

    return { damage, healing, temp, weakenedRounds };
  }

  /**
   * Consome os bônus pendentes e devolve o total. Usado apenas por rituais com
   * dano ou cura; o controle preserva o bônus para a próxima conjuração.
   */
  private takePending(): { total: number; lines: string[] } {
    const bonuses = this.pendingBonuses();
    if (!bonuses.length) {
      return { total: 0, lines: [] };
    }

    const lines: string[] = [];
    let total = 0;
    for (const bonus of bonuses) {
      if (bonus.amount !== undefined) {
        total += bonus.amount;
        lines.push(`${bonus.source}: +${bonus.amount}.`);
        continue;
      }

      const roll = rollExpression(bonus.dice, this.random);
      if (roll) {
        total += roll.total;
        lines.push(`${bonus.source}: ${describeRoll(roll)}.`);
      }
    }

    this.pendingBonuses.set([]);
    return { total, lines };
  }

  /** Habilidade de suporte: sacrifica PV reais e adiciona dados ao próximo ritual. */
  useSpecial(id: NeofitoSpecialId): NeofitoResult {
    const ability = this.specials[id];
    if (!ability) {
      return this.fail('Habilidade não disponível nesta forma.');
    }

    const name = ability.name || NEOFITO_SPECIAL_NAMES[id];
    if (!this.specialReady(id)) {
      return this.fail(`${name}: defina custo em PV e bônus em dados na configuração.`);
    }

    if (this.hitPoints() <= 0) {
      return this.fail('PV em zero: restaure PV antes de usar esta habilidade.');
    }

    const special = this.settings().specials[id];
    const before = this.hitPoints();
    const paid = Math.min(before, special.cost as number);
    this.hitPoints.set(before - paid);
    this.pendingBonuses.update((list) => [...list, { source: name, dice: special.bonus as string }]);

    const lines = [
      `Sacrifício: ${paid} PV reais.`,
      `Bônus: ${special.bonus} no próximo ritual de dano ou cura.`,
      `PV: ${this.hitPoints()} real(is) + ${this.tempHitPoints()} temporário(s).`,
    ];
    if (this.hitPoints() === 0) {
      lines.push('PV reais em zero: o bônus fica pendente até haver PV para conjurar.');
    }
    this.pushLog(name, lines, 'ritual');

    return {
      ok: true,
      message: `${name}: ${special.bonus} adicionado ao próximo ritual por ${paid} PV.`,
      cost: paid,
      sacrificed: paid,
    };
  }

  /**
   * Cartografia Carmesim: ritual supremo da forma mascarada, uma vez por cena.
   * Atinge todos os inimigos marcados, consome as marcas, causa dano, gera PV
   * temporários e enfraquece os alvos. O ritual conclui mesmo se o sacrifício
   * levar o PV real a zero.
   */
  castCartography(): NeofitoResult {
    if (!this.cartography) {
      return this.fail('A Cartografia Carmesim só está disponível na forma mascarada.');
    }

    if (this.sceneUsed()) {
      return this.fail('A Cartografia Carmesim já foi usada nesta cena.');
    }

    if (this.hitPoints() <= 0) {
      return this.fail('PV em zero: a Cartografia Carmesim não pode ser conjurada.');
    }

    const targets = this.markedEnemies();
    if (!targets.length) {
      return this.fail('A Cartografia Carmesim exige ao menos um alvo marcado.');
    }

    if (!this.cartographyReady) {
      return this.fail('Defina dano, sacrifício em PV, cura e duração do enfraquecimento na configuração.');
    }

    const cartography = this.settings().cartography;
    const before = this.hitPoints();
    const paid = Math.min(before, cartography.sacrifice as number);
    this.hitPoints.set(before - paid);

    const damageRoll = rollExpression(cartography.damage ?? undefined, this.random);
    const pending = this.takePending();
    const perTarget = (damageRoll?.total ?? 0) + pending.total;
    const totalDamage = perTarget * targets.length;

    const healRoll = rollExpression(cartography.heal ?? undefined, this.random);
    const healing = healRoll?.total ?? 0;
    this.tempHitPoints.update((value) => value + healing);

    const marksConsumed = targets.reduce((sum, enemy) => sum + enemy.marks, 0);
    for (const enemy of targets) {
      this.setMarks(enemy.id, 0);
    }
    this.sceneUsed.set(true);

    const lines = [
      `Sacrifício: ${paid} PV reais${paid < (cartography.sacrifice as number) ? ' (todo o PV restante)' : ''}.`,
      `Alvos marcados: ${targets.length}. Marcas consumidas: ${marksConsumed}.`,
      `Dano por alvo: ${damageRoll ? describeRoll(damageRoll) : '—'}${pending.total ? ` + ${pending.total}` : ''} = ${perTarget}.`,
      ...pending.lines,
      `Dano total: ${totalDamage}.`,
      `Cura: ${healRoll ? describeRoll(healRoll) : '0'} PV temporários (total ${this.tempHitPoints()}).`,
      `Enfraquecimento: ${cartography.weakenedRounds} rodada(s).`,
      'Uma vez por cena: poder consumido.',
    ];
    if (this.hitPoints() === 0) {
      lines.push('PV reais em zero: a Cartografia foi concluída mesmo assim.');
    }
    this.pushLog('Cartografia Carmesim', lines, 'blood');

    return {
      ok: true,
      message: `Cartografia Carmesim: ${totalDamage} de dano em ${targets.length} alvo(s), ${healing} PV temporários, enfraquecimento por ${cartography.weakenedRounds} rodada(s).`,
      ritual: this.cartography.name,
      cost: paid,
      sacrificed: paid,
      damage: totalDamage,
      healing,
      tempHitPoints: healing,
      marksConsumed,
      weakenedRounds: cartography.weakenedRounds ?? undefined,
    };
  }

  /** Reinicia o custo progressivo; PV temporários e marcas continuam valendo. */
  endTurn(): void {
    this.ritualsThisTurn.set(0);
    this.round.update((round) => round + 1);
    this.pushLog(
      'Turno encerrado',
      ['Custo do próximo ritual volta a 1 PV. PV temporários e marcas permanecem.'],
      'system',
    );
  }

  newScene(): void {
    this.ritualsThisTurn.set(0);
    this.sceneUsed.set(false);
    this.round.set(1);
    this.pushLog(
      'Nova cena',
      ['Cartografia Carmesim disponível novamente. Custo dos rituais reiniciado.'],
      'system',
    );
  }

  /** Fim de combate: PV temporários são descartados, nunca convertidos em reais. */
  endCombat(): void {
    const discarded = this.tempHitPoints();
    this.tempHitPoints.set(0);
    this.pendingBonuses.set([]);
    this.enemies.set([]);
    this.ritualsThisTurn.set(0);
    this.sceneUsed.set(false);
    this.round.set(1);
    this.pushLog(
      'Combate encerrado',
      [`PV temporários descartados: ${discarded}. Estado de combate zerado; PV reais preservados.`],
      'system',
    );
  }

  private setMarks(id: string, marks: number): void {
    const value = Math.max(0, Math.min(MAX_MARKS, Math.floor(marks)));
    this.enemies.update((enemies) =>
      enemies.map((enemy) => (enemy.id === id ? { ...enemy, marks: value } : enemy)),
    );
  }

  private findEnemy(id: string): NeofitoEnemy | undefined {
    return this.enemies().find((enemy) => enemy.id === id);
  }

  private fail(message: string): NeofitoResult {
    this.pushLog('Ação inválida', [message], 'system');
    return { ok: false, message };
  }

  private pushLog(title: string, lines: readonly string[], tone: CombatLogTone): void {
    this.logId += 1;
    const entry: CombatLogEntry = { id: this.logId, round: this.round(), title, lines, tone };
    this.log.update((entries) => [entry, ...entries].slice(0, 40));
  }
}
