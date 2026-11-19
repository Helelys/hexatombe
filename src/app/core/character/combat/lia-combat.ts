import { computed, signal } from '@angular/core';
import { ActionMechanics, Character, CharacterSheet, CharacterSheetAction } from '../character.model';
import { CombatLogEntry, CombatLogTone } from './combat-log';
import {
  DiceRoll,
  RandomSource,
  describeRoll,
  extractDiceExpression,
  rollDice,
  rollExpression,
} from './combat-dice';
import { CombatForm } from './combat-form';

export const MAX_HEMORRHAGE = 3;

const DANCE_DICE: Record<CombatForm, string> = { common: '2d6', masked: '4d6' };
const INSTINCT_DICE: Record<CombatForm, { bleeding: string; full: string }> = {
  common: { bleeding: '1d6', full: '2d6' },
  masked: { bleeding: '2d6', full: '4d6' },
};

export interface LiaEnemy {
  readonly id: string;
  readonly name: string;
  /** Níveis de Hemorragia, de 0 a 3. */
  readonly hemorrhage: number;
}

export interface LiaBonus {
  readonly label: string;
  readonly total: number;
  readonly detail: string;
}

export interface LiaStrike {
  readonly weaponName: string;
  readonly targetId: string;
  readonly targetName: string;
  readonly attackDetail: string;
  readonly attackTotal: number;
  readonly threat: boolean;
  readonly critical: boolean;
  readonly multiplier: number;
  readonly baseDamage: number;
  readonly baseDetail: string;
  readonly bonuses: readonly LiaBonus[];
  readonly totalDamage: number;
  readonly hemorrhageAttempted: boolean;
  readonly hemorrhageApplied: number;
  readonly hemorrhageLevel?: number;
}

export interface LiaAttackOptions {
  /** Confirma uma ameaça de crítico e aplica o multiplicador. */
  readonly critical?: boolean;
  /** Aplica 1 nível de Hemorragia ao acertar com a katana. */
  readonly applyHemorrhage?: boolean;
}

export interface LiaBarrageResult {
  readonly ok: boolean;
  readonly message: string;
  readonly strikes: readonly LiaStrike[];
  readonly totalDamage: number;
  readonly hemorrhageApplied: number;
  readonly hemorrhageTarget: string | null;
}

export interface LiaExecutionResult extends LiaBarrageResult {
  readonly levelsConsumed: number;
  readonly hemorrhageDamage: number;
}

interface ExecutionPower {
  readonly name: string;
  readonly mechanics?: ActionMechanics;
}

function parseThreatMargin(critical: string | undefined): number {
  const match = /^\s*(\d+)\s*\/\s*x\s*\d+/i.exec(critical ?? '');
  return match ? Math.max(2, Math.min(20, Number(match[1]))) : 20;
}

function parseCriticalMultiplier(critical: string | undefined): number {
  const match = /\/\s*x\s*(\d+)/i.exec(critical ?? '');
  return match ? Math.max(2, Number(match[1])) : 2;
}

/**
 * Mesa de combate da Lia Kwon.
 *
 * Automatiza ataque, dano, crítico confirmado, bônus de Feridas Abertas,
 * Instinto Assassino e Dança Sangrenta, a Rajada de Shurikens (3 arremessos,
 * 1 nível de Hemorragia por uso) e o Abate Perfeito (ataques alternados e
 * consumo de todos os níveis para dano extra).
 */
export class LiaCombat {
  readonly form: CombatForm;
  readonly sheet: CharacterSheet;
  readonly maxHitPoints: number;

  readonly round = signal(1);
  readonly enemies = signal<readonly LiaEnemy[]>([]);
  readonly log = signal<readonly CombatLogEntry[]>([]);
  readonly danceUsed = signal(false);
  readonly intentionUsed = signal(false);

  private readonly random: RandomSource;
  private readonly katana: CharacterSheetAction | undefined;
  private readonly shuriken: CharacterSheetAction | undefined;
  private readonly execution: ExecutionPower | undefined;
  private readonly danceDice: string;
  private readonly instinctDice: { bleeding: string; full: string };
  private hitCounts: Record<string, number> = {};
  private logId = 0;
  private enemyId = 0;

  constructor(character: Character, form: CombatForm = 'common', random: RandomSource = Math.random) {
    this.form = form;
    this.random = random;

    const sheet = form === 'masked' ? character.maskedForm?.sheet : character.sheet;
    this.sheet = sheet ?? (character.sheet as CharacterSheet);
    this.maxHitPoints = Number(this.sheet?.hitPoints) || 0;

    this.katana = this.sheet?.actions.find((action) => action.mechanics?.kind === 'weapon');
    this.shuriken = this.sheet?.actions.find((action) => action.mechanics?.kind === 'barrage');
    this.execution =
      form === 'masked' && character.maskedForm?.intention
        ? character.maskedForm.intention
        : this.sheet?.actions.find((action) => action.mechanics?.kind === 'execution');

    this.danceDice = DANCE_DICE[form];
    this.instinctDice = INSTINCT_DICE[form];
  }

  readonly hasTargets = computed(() => this.enemies().length > 0);
  readonly bleedingTargets = computed(() => this.enemies().filter((enemy) => enemy.hemorrhage > 0).length);

  get barrageThrows(): number {
    return this.shuriken?.mechanics?.throws ?? 3;
  }

  get executionAttacks(): number {
    return this.execution?.mechanics?.attacks ?? 3;
  }

  get executionName(): string {
    return this.execution?.name ?? 'Abate Perfeito';
  }

  get canUseIntention(): boolean {
    return !!this.execution && !this.intentionUsed();
  }

  addEnemy(name: string): LiaEnemy | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    this.enemyId += 1;
    const enemy: LiaEnemy = { id: `lia-enemy-${this.enemyId}`, name: trimmed, hemorrhage: 0 };
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
    delete this.hitCounts[id];
    this.pushLog('Alvo removido', [`${enemy.name} saiu do combate.`], 'system');
  }

  /** Aplica níveis de Hemorragia respeitando o teto de 3 e registra o resultado. */
  addHemorrhage(id: string, amount = 1): number {
    const enemy = this.findEnemy(id);
    if (!enemy) {
      return 0;
    }

    const applied = this.changeHemorrhage(id, amount);
    if (applied > 0) {
      const current = this.findEnemy(id)?.hemorrhage ?? enemy.hemorrhage;
      this.pushLog('Hemorragia', [`${enemy.name}: +${applied} nível(is) — agora ${current}/3.`], 'blood');
    } else {
      this.pushLog('Hemorragia', [`${enemy.name} já está no máximo de 3 níveis.`], 'system');
    }

    return applied;
  }

  removeHemorrhage(id: string): void {
    const enemy = this.findEnemy(id);
    if (!enemy || enemy.hemorrhage <= 0) {
      return;
    }

    this.changeHemorrhage(id, -1);
    this.pushLog('Hemorragia', [`${enemy.name}: −1 nível — agora ${enemy.hemorrhage - 1}/3.`], 'blood');
  }

  hemorrhageDice(enemy: LiaEnemy): string {
    return enemy.hemorrhage > 0 ? `${enemy.hemorrhage}d4` : '—';
  }

  hemorrhageBonus(enemy: LiaEnemy): string {
    return enemy.hemorrhage > 0 ? `+${enemy.hemorrhage}d4` : '—';
  }

  instinctBonus(enemy: LiaEnemy): string {
    if (enemy.hemorrhage >= MAX_HEMORRHAGE) {
      return `+${this.instinctDice.full}`;
    }

    if (enemy.hemorrhage > 0) {
      return `+${this.instinctDice.bleeding}`;
    }

    return '—';
  }

  attack(kind: 'katana' | 'shuriken', targetId: string, options: LiaAttackOptions = {}): LiaStrike | null {
    const weapon = kind === 'katana' ? this.katana : this.shuriken;
    const target = this.findEnemy(targetId);
    if (!weapon || !target) {
      return null;
    }

    const applyHemorrhage = options.applyHemorrhage ?? kind === 'katana';
    const strike = this.buildStrike(weapon, target, {
      critical: options.critical ?? false,
      applyHemorrhage: kind === 'katana' && applyHemorrhage,
    });

    this.pushLog(kind === 'katana' ? 'Katana do Risco' : 'Shuriken', this.describeStrike(strike), 'damage');
    return strike;
  }

  /** Rajada: um arremesso por alvo escolhido, com ataque e dano próprios. */
  shurikenBarrage(targetIds: readonly string[]): LiaBarrageResult {
    if (!this.shuriken) {
      return this.fail('A Shuriken não está disponível nesta forma.');
    }

    if (!targetIds.length) {
      return this.fail('Escolha pelo menos um alvo para a Rajada de Shurikens.');
    }

    const strikes: LiaStrike[] = [];
    for (let index = 0; index < this.barrageThrows; index += 1) {
      const id = targetIds[index] ?? targetIds[targetIds.length - 1];
      const target = this.findEnemy(id);
      if (!target) {
        continue;
      }

      strikes.push(this.buildStrike(this.shuriken, target, { critical: false, applyHemorrhage: false }));
    }

    if (!strikes.length) {
      return this.fail('Nenhum alvo válido para a Rajada.');
    }

    let hemorrhageApplied = 0;
    let hemorrhageTarget: string | null = null;
    const firstEnemy = this.findEnemy(strikes[0].targetId);
    if (firstEnemy) {
      hemorrhageApplied = this.changeHemorrhage(firstEnemy.id, 1);
      if (hemorrhageApplied > 0) {
        hemorrhageTarget = firstEnemy.name;
      }
    }

    const lines = strikes.flatMap((strike, index) => [
      `Arremesso ${index + 1} → ${strike.targetName}: ${strike.attackDetail}; dano ${strike.totalDamage}.`,
      ...strike.bonuses.map((bonus) => `  ${bonus.label}: ${bonus.detail}`),
    ]);
    if (hemorrhageApplied > 0 && hemorrhageTarget) {
      lines.push(`Hemorragia: +1 nível em ${hemorrhageTarget} (1 por uso da Rajada).`);
    } else {
      lines.push('Hemorragia: o alvo principal já está no máximo de 3 níveis.');
    }

    const totalDamage = strikes.reduce((sum, strike) => sum + strike.totalDamage, 0);
    lines.push(`Dano total da rajada: ${totalDamage}.`);
    this.pushLog('Rajada de Shurikens', lines, 'damage');

    return {
      ok: true,
      message: `Rajada resolvida: ${strikes.length} arremesso(s), ${totalDamage} de dano.`,
      strikes,
      totalDamage,
      hemorrhageApplied,
      hemorrhageTarget,
    };
  }

  /**
   * Abate Perfeito: ataques alternando katana e shuriken e, no fim, dano extra
   * por nível de Hemorragia do alvo, que é zerada. Uma vez por cena.
   */
  perfectReckoning(targetId: string): LiaExecutionResult {
    const target = this.findEnemy(targetId);
    if (!target) {
      return { ...this.emptyResult(), message: 'Escolha um alvo para o Abate Perfeito.' };
    }

    if (!this.execution) {
      return { ...this.emptyResult(), message: 'O Abate Perfeito só está disponível na forma mascarada.' };
    }

    if (this.intentionUsed()) {
      return { ...this.emptyResult(), message: 'O Abate Perfeito já foi usado nesta cena.' };
    }

    if (!this.katana || !this.shuriken) {
      return { ...this.emptyResult(), message: 'As armas do Abate não estão disponíveis.' };
    }

    const levelsConsumed = target.hemorrhage;
    const strikes: LiaStrike[] = [];
    for (let index = 0; index < this.executionAttacks; index += 1) {
      const weapon = index % 2 === 0 ? this.katana : this.shuriken;
      strikes.push(this.buildStrike(weapon, target, { critical: false, applyHemorrhage: false }));
    }

    const perLevel = this.execution?.mechanics?.hemorrhageDamagePerLevel ?? '3d8';
    const hemorrhageRolls: DiceRoll[] = [];
    for (let level = 0; level < levelsConsumed; level += 1) {
      const roll = rollExpression(perLevel, this.random);
      if (roll) {
        hemorrhageRolls.push(roll);
      }
    }

    const hemorrhageDamage = hemorrhageRolls.reduce((sum, roll) => sum + roll.total, 0);
    if (levelsConsumed > 0) {
      this.changeHemorrhage(target.id, -levelsConsumed);
    }

    this.intentionUsed.set(true);

    const totalDamage = strikes.reduce((sum, strike) => sum + strike.totalDamage, 0) + hemorrhageDamage;
    const lines = [
      `${this.executionName} → ${target.name} (${strikes.length} ataques alternados).`,
      ...strikes.map(
        (strike, index) =>
          `Ataque ${index + 1} (${strike.weaponName}): ${strike.attackDetail}; dano ${strike.totalDamage}.`,
      ),
    ];
    for (const bonus of strikes.flatMap((strike) => strike.bonuses)) {
      lines.push(`${bonus.label}: ${bonus.detail}`);
    }

    if (levelsConsumed > 0) {
      lines.push(
        `Níveis consumidos: ${levelsConsumed}. Dano extra: ${hemorrhageRolls.map(describeRoll).join('; ')} = ${hemorrhageDamage}.`,
        'Hemorragia zerada no alvo.',
      );
    } else {
      lines.push('Alvo sem Hemorragia: nenhum dano extra foi gerado.');
    }
    lines.push(`Dano total: ${totalDamage}.`);
    this.pushLog(this.executionName, lines, 'blood');

    return {
      ok: true,
      message: `${this.executionName}: ${totalDamage} de dano total (${levelsConsumed} nível(is) consumido(s)).`,
      strikes,
      totalDamage,
      hemorrhageApplied: 0,
      hemorrhageTarget: null,
      levelsConsumed,
      hemorrhageDamage,
    };
  }

  /** Dano contínuo de início de turno: 1d4 por nível de Hemorragia. */
  rollContinuous(id: string): DiceRoll | null {
    const enemy = this.findEnemy(id);
    if (!enemy || enemy.hemorrhage <= 0) {
      return null;
    }

    const roll = rollDice(enemy.hemorrhage, 4, this.random);
    this.pushLog(
      'Sangramento',
      [`${enemy.name} (${enemy.hemorrhage} níveis): ${describeRoll(roll)} de dano contínuo.`],
      'blood',
    );
    return roll;
  }

  rollContinuousAll(): number {
    const bleeding = this.enemies().filter((enemy) => enemy.hemorrhage > 0);
    if (!bleeding.length) {
      this.pushLog('Sangramento', ['Nenhum inimigo com Hemorragia.'], 'system');
      return 0;
    }

    const lines: string[] = [];
    let total = 0;
    for (const enemy of bleeding) {
      const roll = rollDice(enemy.hemorrhage, 4, this.random);
      total += roll.total;
      lines.push(`${enemy.name} (${enemy.hemorrhage} níveis): ${describeRoll(roll)}.`);
    }
    lines.push(`Dano contínuo total: ${total}.`);

    this.pushLog('Início do turno inimigo', lines, 'blood');
    return total;
  }

  endTurn(): void {
    this.hitCounts = {};
    this.danceUsed.set(false);
    this.round.update((round) => round + 1);
    this.pushLog('Turno encerrado', ['Contagem de acertos e Dança Sangrenta reiniciadas.'], 'system');
  }

  /** Nova cena: libera o Abate Perfeito e reinicia os contadores de turno. */
  newScene(): void {
    this.hitCounts = {};
    this.danceUsed.set(false);
    this.intentionUsed.set(false);
    this.round.set(1);
    this.pushLog('Nova cena', ['Abate Perfeito e Dança Sangrenta disponíveis novamente.'], 'system');
  }

  endCombat(): void {
    const removed = this.enemies().length;
    this.enemies.set([]);
    this.hitCounts = {};
    this.danceUsed.set(false);
    this.intentionUsed.set(false);
    this.round.set(1);
    this.pushLog('Combate encerrado', [`${removed} alvo(s) removido(s). Estado de combate zerado.`], 'system');
  }

  private buildStrike(
    weapon: CharacterSheetAction,
    target: LiaEnemy,
    options: { critical: boolean; applyHemorrhage: boolean },
  ): LiaStrike {
    const attackExpression = extractDiceExpression(weapon.test) ?? '1d20';
    const attackRoll = rollExpression(attackExpression, this.random) ?? rollDice(1, 20, this.random);

    const damageExpression = extractDiceExpression(weapon.damage) ?? '1d4';
    const damageRoll = rollExpression(damageExpression, this.random) ?? rollDice(1, 4, this.random);

    const margin = parseThreatMargin(weapon.critical);
    const natural = attackRoll.rolls[0] ?? 0;
    const threat = natural >= margin;
    const critical = options.critical || natural === 20;
    const multiplier = critical ? parseCriticalMultiplier(weapon.critical) : 1;
    const baseDamage = damageRoll.total * multiplier;

    const bonuses: LiaBonus[] = [];

    if (target.hemorrhage > 0) {
      const roll = rollDice(target.hemorrhage, 4, this.random);
      bonuses.push({
        label: `Feridas Abertas (${target.hemorrhage} níveis)`,
        total: roll.total,
        detail: describeRoll(roll),
      });
    }

    const instinctExpression =
      target.hemorrhage >= MAX_HEMORRHAGE
        ? this.instinctDice.full
        : target.hemorrhage > 0
          ? this.instinctDice.bleeding
          : null;
    if (instinctExpression) {
      const roll = rollExpression(instinctExpression, this.random);
      if (roll) {
        bonuses.push({
          label: `Instinto Assassino (${target.hemorrhage} níveis)`,
          total: roll.total,
          detail: describeRoll(roll),
        });
      }
    }

    const previousHits = this.hitCounts[target.id] ?? 0;
    const hits = previousHits + 1;
    this.hitCounts[target.id] = hits;

    if (hits >= 2 && !this.danceUsed()) {
      const roll = rollExpression(this.danceDice, this.random);
      if (roll) {
        bonuses.push({ label: 'Dança Sangrenta', total: roll.total, detail: describeRoll(roll) });
        this.danceUsed.set(true);
      }
    }

    const hemorrhageAttempted = options.applyHemorrhage;
    const hemorrhageApplied = hemorrhageAttempted ? this.changeHemorrhage(target.id, 1) : 0;
    const totalDamage = baseDamage + bonuses.reduce((sum, bonus) => sum + bonus.total, 0);
    const baseDetail =
      multiplier > 1
        ? `${describeRoll(damageRoll)} × ${multiplier} = ${baseDamage}`
        : describeRoll(damageRoll);

    return {
      weaponName: weapon.name,
      targetId: target.id,
      targetName: target.name,
      attackDetail: describeRoll(attackRoll),
      attackTotal: attackRoll.total,
      threat,
      critical,
      multiplier,
      baseDamage,
      baseDetail,
      bonuses,
      totalDamage,
      hemorrhageAttempted,
      hemorrhageApplied,
      hemorrhageLevel: hemorrhageApplied > 0 ? this.findEnemy(target.id)?.hemorrhage : undefined,
    };
  }

  private describeStrike(strike: LiaStrike): string[] {
    const lines = [
      `Alvo: ${strike.targetName}`,
      `Ataque: ${strike.attackDetail}`,
      `Dano: ${strike.baseDetail}`,
      ...strike.bonuses.map((bonus) => `${bonus.label}: ${bonus.detail}`),
      `Total: ${strike.totalDamage}.`,
    ];

    if (strike.threat && !strike.critical) {
      lines.push('Ameaça de crítico: marque "Crítico confirmado" para multiplicar o dano.');
    }
    if (strike.critical) {
      lines.push(`Crítico confirmado: dano multiplicado por ${strike.multiplier}.`);
    }
    if (strike.hemorrhageAttempted) {
      lines.push(
        strike.hemorrhageApplied > 0
          ? `Hemorragia: +${strike.hemorrhageApplied} nível (${strike.hemorrhageLevel}/3).`
          : 'Hemorragia: alvo já está no máximo de 3 níveis.',
      );
    }

    return lines;
  }

  private changeHemorrhage(id: string, amount: number): number {
    const enemies = this.enemies();
    const enemy = enemies.find((entry) => entry.id === id);
    if (!enemy) {
      return 0;
    }

    const next = Math.max(0, Math.min(MAX_HEMORRHAGE, enemy.hemorrhage + Math.floor(amount)));
    const applied = next - enemy.hemorrhage;
    if (applied === 0) {
      return 0;
    }

    this.enemies.set(enemies.map((entry) => (entry.id === id ? { ...entry, hemorrhage: next } : entry)));
    return applied;
  }

  private findEnemy(id: string): LiaEnemy | undefined {
    return this.enemies().find((enemy) => enemy.id === id);
  }

  private emptyResult(): LiaExecutionResult {
    return {
      ok: false,
      message: '',
      strikes: [],
      totalDamage: 0,
      hemorrhageApplied: 0,
      hemorrhageTarget: null,
      levelsConsumed: 0,
      hemorrhageDamage: 0,
    };
  }

  private fail(message: string): LiaBarrageResult {
    this.pushLog('Ação inválida', [message], 'system');
    return { ok: false, message, strikes: [], totalDamage: 0, hemorrhageApplied: 0, hemorrhageTarget: null };
  }

  private pushLog(title: string, lines: readonly string[], tone: CombatLogTone): void {
    this.logId += 1;
    const entry: CombatLogEntry = { id: this.logId, round: this.round(), title, lines, tone };
    this.log.update((entries) => [entry, ...entries].slice(0, 40));
  }
}
