import { CHARACTERS } from '../characters.data';
import { Character } from '../character.model';
import { LiaCombat, MAX_HEMORRHAGE } from './lia-combat';

const LIA = CHARACTERS.find((character) => character.slug === 'lia-kwon') as Character;

/** Fonte determinística: todo dado cai em 1. */
const lowest = () => 0;

function create(form: 'common' | 'masked' = 'common'): LiaCombat {
  return new LiaCombat(LIA, form, lowest);
}

describe('LiaCombat — alvos e Hemorragia', () => {
  it('registra alvos, ignora nomes vazios e remove pelo id', () => {
    const combat = create();

    expect(combat.addEnemy('   ')).toBeNull();
    const enemy = combat.addEnemy('  Cultista ');

    expect(enemy).toMatchObject({ name: 'Cultista', hemorrhage: 0 });
    expect(combat.hasTargets()).toBe(true);
    expect(combat.log()[0]?.title).toBe('Alvo registrado');

    combat.removeEnemy(enemy!.id);

    expect(combat.hasTargets()).toBe(false);
    expect(combat.addHemorrhage(enemy!.id, 1)).toBe(0);
  });

  it('acumula níveis até o teto de 3 e desconta sem ficar negativo', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    expect(MAX_HEMORRHAGE).toBe(3);
    expect(combat.addHemorrhage(enemy.id, 2)).toBe(2);
    expect(combat.addHemorrhage(enemy.id, 2)).toBe(1);
    expect(combat.addHemorrhage(enemy.id, 1)).toBe(0);
    expect(combat.enemies()[0]?.hemorrhage).toBe(3);

    for (let index = 0; index < 4; index += 1) {
      combat.removeHemorrhage(enemy.id);
    }

    expect(combat.enemies()[0]?.hemorrhage).toBe(0);
  });

  it('descreve os dados e bônus da Hemorragia na forma comum', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    expect(combat.hemorrhageDice(enemy)).toBe('—');
    expect(combat.hemorrhageBonus(enemy)).toBe('—');
    expect(combat.instinctBonus(enemy)).toBe('—');

    combat.addHemorrhage(enemy.id, 1);
    const bleeding = combat.enemies()[0]!;

    expect(combat.hemorrhageDice(bleeding)).toBe('1d4');
    expect(combat.hemorrhageBonus(bleeding)).toBe('+1d4');
    expect(combat.instinctBonus(bleeding)).toBe('+1d6');

    combat.addHemorrhage(enemy.id, 2);
    const full = combat.enemies()[0]!;

    expect(combat.instinctBonus(full)).toBe('+2d6');
    expect(combat.bleedingTargets()).toBe(1);
  });

  it('usa os dados maiores na forma mascarada', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;

    combat.addHemorrhage(enemy.id, 1);

    expect(combat.instinctBonus(combat.enemies()[0]!)).toBe('+2d6');

    combat.addHemorrhage(enemy.id, 2);

    expect(combat.instinctBonus(combat.enemies()[0]!)).toBe('+4d6');
  });

  it('rola o sangramento contínuo de 1d4 por nível', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    expect(combat.rollContinuous(enemy.id)).toBeNull();

    combat.addHemorrhage(enemy.id, 2);

    const roll = combat.rollContinuous(enemy.id);

    expect(roll?.expression).toBe('2d4');
    expect(roll?.total).toBe(2);
    expect(combat.rollContinuousAll()).toBe(2);
  });

  it('avisa quando não há ninguém sangrando no início do turno', () => {
    const combat = create();
    combat.addEnemy('Cultista');

    expect(combat.rollContinuousAll()).toBe(0);
    expect(combat.log()[0]?.title).toBe('Sangramento');
  });
});


describe('LiaCombat — ataques', () => {
  it('aplica 1 nível de Hemorragia na katana por padrão', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const strike = combat.attack('katana', enemy.id)!;

    expect(strike).toMatchObject({
      weaponName: 'Katana',
      hemorrhageAttempted: true,
      hemorrhageApplied: 1,
      hemorrhageLevel: 1,
      totalDamage: 9,
    });
    expect(combat.enemies()[0]?.hemorrhage).toBe(1);
    expect(strike.bonuses).toEqual([]);
  });

  it('permite desligar a Hemorragia da katana', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const strike = combat.attack('katana', enemy.id, { applyHemorrhage: false })!;

    expect(strike.hemorrhageAttempted).toBe(false);
    expect(strike.hemorrhageApplied).toBe(0);
    expect(combat.enemies()[0]?.hemorrhage).toBe(0);
  });

  it('soma Feridas Abertas e Instinto Assassino conforme os níveis', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;
    combat.addHemorrhage(enemy.id, 1);

    const bleeding = combat.attack('katana', enemy.id, { applyHemorrhage: false })!;

    expect(bleeding.bonuses.map((bonus) => bonus.label)).toEqual([
      'Feridas Abertas (1 níveis)',
      'Instinto Assassino (1 níveis)',
    ]);
    expect(bleeding.bonuses.map((bonus) => bonus.total)).toEqual([1, 1]);
    expect(bleeding.totalDamage).toBe(11);

    combat.addHemorrhage(enemy.id, 2);

    const full = combat.attack('katana', enemy.id, { applyHemorrhage: false })!;

    expect(full.bonuses.slice(0, 2).map((bonus) => bonus.total)).toEqual([3, 2]);
    expect(full.bonuses[2]?.label).toBe('Dança Sangrenta');
    expect(full.totalDamage).toBe(16);
  });

  it('multiplica o dano quando o crítico é confirmado', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const strike = combat.attack('katana', enemy.id, { critical: true })!;

    expect(strike.multiplier).toBe(3);
    expect(strike.baseDamage).toBe(27);
    expect(strike.baseDetail).toContain('× 3');
    expect(strike.totalDamage).toBe(27);
  });

  it('libera a Dança Sangrenta apenas uma vez por turno', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const second = combat.attack('katana', enemy.id)!;
    const third = combat.attack('katana', enemy.id)!;
    const fourth = combat.attack('katana', enemy.id)!;

    expect(second.bonuses.some((bonus) => bonus.label === 'Dança Sangrenta')).toBe(false);
    expect(third.bonuses.some((bonus) => bonus.label === 'Dança Sangrenta')).toBe(true);
    expect(fourth.bonuses.some((bonus) => bonus.label === 'Dança Sangrenta')).toBe(false);
    expect(combat.danceUsed()).toBe(true);
  });

  it('reabre a Dança no início do próximo turno', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    combat.attack('katana', enemy.id);
    combat.attack('katana', enemy.id);
    combat.endTurn();

    expect(combat.danceUsed()).toBe(false);
    expect(combat.round()).toBe(2);

    const next = combat.attack('katana', enemy.id)!;

    expect(next.bonuses.some((bonus) => bonus.label === 'Dança Sangrenta')).toBe(false);
  });

  it('devolve null para arma ou alvo inexistente', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    expect(combat.attack('katana', 'nao-existe')).toBeNull();
    combat.removeEnemy(enemy.id);
    expect(combat.attack('shuriken', enemy.id)).toBeNull();
  });
});

describe('LiaCombat — Rajada de Shurikens', () => {
  it('resolve 3 arremessos e aplica 1 nível no alvo principal', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const result = combat.shurikenBarrage([enemy.id]);

    expect(result.ok).toBe(true);
    expect(result.strikes).toHaveLength(3);
    expect(result.strikes.map((strike) => strike.weaponName)).toEqual([
      'Shuriken de Tendão',
      'Shuriken de Tendão',
      'Shuriken de Tendão',
    ]);
    expect(result.hemorrhageApplied).toBe(1);
    expect(result.hemorrhageTarget).toBe('Cultista');
    expect(result.totalDamage).toBe(20);
    expect(combat.enemies()[0]?.hemorrhage).toBe(1);
    expect(combat.log()[0]?.title).toBe('Rajada de Shurikens');
  });

  it('distribui os arremessos entre os alvos informados', () => {
    const combat = create();
    const first = combat.addEnemy('Cultista')!;
    const second = combat.addEnemy('Segurança')!;

    const result = combat.shurikenBarrage([first.id, second.id]);

    expect(result.strikes.map((strike) => strike.targetName)).toEqual([
      'Cultista',
      'Segurança',
      'Segurança',
    ]);
    expect(result.hemorrhageTarget).toBe('Cultista');
  });

  it('exige ao menos um alvo', () => {
    const combat = create();

    const result = combat.shurikenBarrage([]);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Escolha pelo menos um alvo');
    expect(combat.log()[0]?.title).toBe('Ação inválida');
  });

  it('avisa quando o alvo já está com a Hemorragia no teto', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;
    combat.addHemorrhage(enemy.id, 3);

    const result = combat.shurikenBarrage([enemy.id]);

    expect(result.hemorrhageApplied).toBe(0);
    expect(result.hemorrhageTarget).toBeNull();
    expect(result.message).toContain('Rajada resolvida');
    expect(combat.enemies()[0]?.hemorrhage).toBe(3);
  });
});


describe('LiaCombat — Abate Perfeito', () => {
  it('só está disponível na forma mascarada', () => {
    const combat = create('common');
    const enemy = combat.addEnemy('Cultista')!;

    expect(combat.canUseIntention).toBe(false);

    const result = combat.perfectReckoning(enemy.id);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('forma mascarada');
    expect(combat.intentionUsed()).toBe(false);
  });

  it('exige um alvo válido', () => {
    const combat = create('masked');

    const result = combat.perfectReckoning('nao-existe');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Escolha um alvo');
  });

  it('alterna as armas, consome a Hemorragia e fecha a cena', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;
    combat.addHemorrhage(enemy.id, 3);

    expect(combat.canUseIntention).toBe(true);
    expect(combat.executionName).toBe('Abate Perfeito');
    expect(combat.executionAttacks).toBe(3);

    const result = combat.perfectReckoning(enemy.id);

    expect(result.ok).toBe(true);
    expect(result.strikes.map((strike) => strike.weaponName)).toEqual([
      'Katana do Risco',
      'Shuriken de Tendão',
      'Katana do Risco',
    ]);
    expect(result.levelsConsumed).toBe(3);
    expect(result.hemorrhageDamage).toBe(9);
    expect(result.totalDamage).toBe(75);
    expect(combat.enemies()[0]?.hemorrhage).toBe(0);
    expect(combat.intentionUsed()).toBe(true);
    expect(combat.canUseIntention).toBe(false);
    expect(combat.log()[0]?.title).toBe('Abate Perfeito');
  });

  it('conclui sem dano extra quando o alvo não sangra', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;

    const result = combat.perfectReckoning(enemy.id);

    expect(result.ok).toBe(true);
    expect(result.levelsConsumed).toBe(0);
    expect(result.hemorrhageDamage).toBe(0);
    expect(result.totalDamage).toBe(45);
  });

  it('bloqueia o segundo uso na mesma cena e libera em uma nova cena', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;

    combat.perfectReckoning(enemy.id);

    const blocked = combat.perfectReckoning(enemy.id);

    expect(blocked.ok).toBe(false);
    expect(blocked.message).toContain('já foi usado');

    combat.newScene();

    expect(combat.canUseIntention).toBe(true);
    expect(combat.perfectReckoning(enemy.id).ok).toBe(true);
  });
});

describe('LiaCombat — estado do combate', () => {
  it('zera alvos, rodada e usos ao encerrar o combate', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;

    combat.addHemorrhage(enemy.id, 2);
    combat.perfectReckoning(enemy.id);
    combat.endCombat();

    expect(combat.enemies()).toEqual([]);
    expect(combat.round()).toBe(1);
    expect(combat.intentionUsed()).toBe(false);
    expect(combat.danceUsed()).toBe(false);
    expect(combat.log()[0]?.title).toBe('Combate encerrado');
  });

  it('mantém no máximo 40 entradas no registro', () => {
    const combat = create();

    for (let index = 0; index < 45; index += 1) {
      combat.addEnemy(`Alvo ${index}`);
    }

    expect(combat.log()).toHaveLength(40);
  });
});

