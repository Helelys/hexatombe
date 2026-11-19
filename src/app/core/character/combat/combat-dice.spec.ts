import {
  describeRoll,
  extractDiceExpression,
  parseDiceExpression,
  rollDice,
  rollExpression,
} from './combat-dice';

/** Fonte determinística: todo dado cai no menor valor possível. */
const lowest: () => number = () => 0;
/** Fonte determinística: todo dado cai no maior valor possível. */
const highest: () => number = () => 0.999999999;

describe('extractDiceExpression', () => {
  it('recorta a expressão de um teste ou de um dano', () => {
    expect(extractDiceExpression('Luta 5d20+10')).toBe('5d20+10');
    expect(extractDiceExpression('4d6 + 12')).toBe('4d6+12');
    expect(extractDiceExpression('Dano 3d8-2 perfuração')).toBe('3d8-2');
  });

  it('devolve null quando não há dados', () => {
    expect(extractDiceExpression(undefined)).toBeNull();
    expect(extractDiceExpression('')).toBeNull();
    expect(extractDiceExpression('Fortitude DT 20')).toBeNull();
  });
});

describe('parseDiceExpression', () => {
  it('interpreta contagem, faces e modificador', () => {
    expect(parseDiceExpression('4d8+2')).toEqual({ count: 4, sides: 8, modifier: 2 });
    expect(parseDiceExpression('2d6-1')).toEqual({ count: 2, sides: 6, modifier: -1 });
    expect(parseDiceExpression(' 1d20 ')).toEqual({ count: 1, sides: 20, modifier: 0 });
  });

  it('rejeita expressões incompletas ou impossíveis', () => {
    expect(parseDiceExpression(undefined)).toBeNull();
    expect(parseDiceExpression('d20')).toBeNull();
    expect(parseDiceExpression('0d6')).toBeNull();
    expect(parseDiceExpression('1d1')).toBeNull();
    expect(parseDiceExpression('dano 4d8')).toBeNull();
  });
});

describe('rollDice', () => {
  it('rola a quantidade pedida e soma os resultados', () => {
    const roll = rollDice(3, 6, lowest);

    expect(roll).toMatchObject({ expression: '3d6', count: 3, sides: 6, modifier: 0 });
    expect(roll.rolls).toEqual([1, 1, 1]);
    expect(roll.total).toBe(3);
  });

  it('respeita o maior valor de cada face', () => {
    expect(rollDice(2, 20, highest).rolls).toEqual([20, 20]);
  });

  it('protege contra contagens e faces inválidas', () => {
    const roll = rollDice(-2, 1, lowest);

    expect(roll.expression).toBe('0d2');
    expect(roll.rolls).toEqual([]);
    expect(roll.total).toBe(0);
  });

  it('normaliza uma fonte de aleatoriedade fora do intervalo', () => {
    expect(rollDice(1, 10, () => Number.NaN).rolls).toEqual([1]);
    expect(rollDice(1, 10, () => 4).rolls).toEqual([10]);
  });
});

describe('rollExpression', () => {
  it('soma o modificador ao total dos dados', () => {
    const roll = rollExpression('5d20+10', lowest);

    expect(roll?.rolls).toEqual([1, 1, 1, 1, 1]);
    expect(roll?.modifier).toBe(10);
    expect(roll?.total).toBe(15);
  });

  it('aplica modificadores negativos', () => {
    const roll = rollExpression('2d8-3', lowest);

    expect(roll?.modifier).toBe(-3);
    expect(roll?.total).toBe(-1);
  });

  it('devolve null para expressões inválidas', () => {
    expect(rollExpression(undefined, lowest)).toBeNull();
    expect(rollExpression('Luta', lowest)).toBeNull();
  });
});

describe('describeRoll', () => {
  it('mostra os dados, o modificador e o total', () => {
    expect(describeRoll(rollDice(2, 8, lowest))).toBe('2d8 [1, 1] = 2');
    expect(describeRoll(rollExpression('2d8+8', lowest)!)).toBe('2d8 [1, 1] + 8 = 10');
  });

  it('usa o travessão no modificador negativo', () => {
    expect(describeRoll(rollExpression('2d8-3', lowest)!)).toBe('2d8 [1, 1] − 3 = -1');
  });
});
