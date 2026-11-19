/**
 * Rolagem de dados usada pelas fichas automatizadas de Lia Kwon e do Neófito.
 * Mantém a expressão original para o registro de combate, de modo que a mesa
 * consiga conferir cada resultado em vez de confiar em um total opaco.
 */

export type RandomSource = () => number;

export interface DiceSpec {
  readonly count: number;
  readonly sides: number;
  readonly modifier: number;
}

export interface DiceRoll extends DiceSpec {
  readonly expression: string;
  readonly rolls: readonly number[];
  readonly total: number;
}

const DICE_PATTERN = /(\d+)\s*d\s*(\d+)\s*(?:([+-])\s*(\d+))?/i;
const STRICT_DICE_PATTERN = /^(\d+)\s*d\s*(\d+)\s*(?:([+-])\s*(\d+))?$/i;

/** Recorta a primeira expressão de dados de um texto como `Luta 5d20+10`. */
export function extractDiceExpression(source: string | undefined): string | null {
  if (!source) {
    return null;
  }

  const match = DICE_PATTERN.exec(source);
  return match ? match[0].replace(/\s+/g, '') : null;
}

/** Interpreta uma expressão pura como `4d8+2`; devolve `null` se não for válida. */
export function parseDiceExpression(expression: string | undefined): DiceSpec | null {
  if (!expression) {
    return null;
  }

  const match = STRICT_DICE_PATTERN.exec(expression.trim());
  if (!match) {
    return null;
  }

  const count = Number(match[1]);
  const sides = Number(match[2]);
  if (!Number.isFinite(count) || count < 1 || sides < 2) {
    return null;
  }

  const sign = match[3] === '-' ? -1 : 1;
  const modifier = match[4] ? sign * Number(match[4]) : 0;

  return { count, sides, modifier };
}

function rollDie(sides: number, random: RandomSource): number {
  const value = random();
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999) : 0;
  return Math.floor(safe * sides) + 1;
}

/** Rola uma quantidade fixa de dados de um mesmo tipo. */
export function rollDice(count: number, sides: number, random: RandomSource = Math.random): DiceRoll {
  const safeCount = Math.max(0, Math.floor(count));
  const safeSides = Math.max(2, Math.floor(sides));
  const rolls: number[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    rolls.push(rollDie(safeSides, random));
  }

  return {
    expression: `${safeCount}d${safeSides}`,
    count: safeCount,
    sides: safeSides,
    modifier: 0,
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0),
  };
}

/** Rola uma expressão como `5d20+10`; devolve `null` se a expressão for inválida. */
export function rollExpression(
  expression: string | undefined,
  random: RandomSource = Math.random,
): DiceRoll | null {
  const spec = parseDiceExpression(expression);
  if (!spec) {
    return null;
  }

  const base = rollDice(spec.count, spec.sides, random);
  return { ...base, modifier: spec.modifier, total: base.total + spec.modifier };
}

/**
 * Descreve a rolagem para o registro: `2d8+8 [6, 7] + 8 = 21`.
 * O sinal de menos usa o travessão para não competir com o separador.
 */
export function describeRoll(roll: DiceRoll): string {
  const modifier = roll.modifier === 0
    ? ''
    : ` ${roll.modifier > 0 ? '+' : '−'} ${Math.abs(roll.modifier)}`;

  return `${roll.expression} [${roll.rolls.join(', ')}]${modifier} = ${roll.total}`;
}
