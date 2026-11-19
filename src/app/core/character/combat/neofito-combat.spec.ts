import { CHARACTERS } from '../characters.data';
import { Character } from '../character.model';
import { NeofitoCombat, isCartographyConfigured, isSpecialConfigured } from './neofito-combat';

const NEOFITO = CHARACTERS.find((character) => character.slug === 'neofito') as Character;

/** Fonte determinística: todo dado cai em 1. */
const lowest = () => 0;

function create(form: 'common' | 'masked' = 'common'): NeofitoCombat {
  return new NeofitoCombat(NEOFITO, form, lowest);
}

/** Informa na mesa todos os valores que a ficha final ainda não fixou. */
function configure(combat: NeofitoCombat): void {
  combat.updateSettings((settings) => ({
    ...settings,
    markCost: 5,
    ritualEffects: {
      ...settings.ritualEffects,
      'Ritual de Dano': { damage: '2d8', heal: null, rounds: null },
      'Ritual de Cura': { damage: null, heal: '2d8', rounds: null },
      'Ritual de Controle': { damage: null, heal: null, rounds: 2 },
      'Ritual Híbrido': { damage: '1d6', heal: '1d6', rounds: null },
    },
    cartography: { damage: '2d8', sacrifice: 10, heal: '1d8', weakenedRounds: 2 },
    specials: {
      offering: { cost: 4, bonus: '2d8' },
      rite: { cost: 2, bonus: '1d4' },
    },
  }));
}

describe('NeofitoCombat — estado inicial', () => {
  it('parte da ficha comum com os cinco rituais e sem números inventados', () => {
    const combat = create();

    expect(combat.maxHitPoints).toBe(110);
    expect(combat.hitPoints()).toBe(110);
    expect(combat.tempHitPoints()).toBe(0);
    expect(combat.totalHitPoints()).toBe(110);
    expect(combat.rituals.map((ritual) => ritual.name)).toEqual([
      'Hemofagia',
      'Ritual de Dano',
      'Ritual de Cura',
      'Ritual de Controle',
      'Ritual Híbrido',
    ]);
    expect(combat.ritualLimit).toBe(2);
    expect(combat.ritualLimitLabel).toBe('2 rituais por turno');
    expect(combat.nextRitualCost()).toBe(1);
    expect(combat.cartography).toBeUndefined();
    expect(combat.cartographyReady).toBe(false);
    expect(combat.sceneUsed()).toBe(false);
  });

  it('libera as duas habilidades de suporte herdadas do dossiê', () => {
    const combat = create();

    expect(Object.keys(combat.specials).sort()).toEqual(['offering', 'rite']);
    expect(combat.specials.offering?.name).toBe('Oferenda de Sangue');
    expect(combat.specials.rite?.name).toBe('Prece de Ferida');
    expect(combat.specialReady('offering')).toBe(false);
  });

  it('sem configuração, nenhum ritual adicional pode ser conjurado', () => {
    const combat = create();

    expect(combat.ritualReady(combat.rituals[1])).toBe(false);
    expect(combat.canCast(combat.rituals[1])).toBe(false);
    expect(combat.castRitual('Ritual de Dano').ok).toBe(false);
    expect(combat.castRitual('Ritual de Dano').message).toContain('defina os valores na configuração');
  });

  it('rejeita rituais que não existem nesta forma', () => {
    const combat = create();

    expect(combat.castRitual('Bola de Fogo')).toMatchObject({ ok: false });
    expect(combat.castRitual('Bola de Fogo').message).toBe('Ritual não encontrado nesta forma.');
  });
});

describe('NeofitoCombat — marcas de sangue', () => {
  it('exige o custo configurado antes de marcar', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;

    const result = combat.applyMark(enemy.id);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('custo em PV de cada marca');
    expect(combat.hitPoints()).toBe(110);
  });

  it('sacrifica PV reais e respeita o teto de 3 marcas por alvo', () => {
    const combat = create();
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;

    expect(combat.applyMark(enemy.id)).toMatchObject({ ok: true, cost: 5, sacrificed: 5 });
    combat.applyMark(enemy.id);
    combat.applyMark(enemy.id);

    expect(combat.hitPoints()).toBe(95);
    expect(combat.enemies()[0]?.marks).toBe(3);
    expect(combat.markedEnemies()).toHaveLength(1);

    const capped = combat.applyMark(enemy.id);

    expect(capped.ok).toBe(false);
    expect(capped.message).toContain('já tem 3 marcas');

    combat.removeMark(enemy.id);

    expect(combat.enemies()[0]?.marks).toBe(2);
    expect(combat.hitPoints()).toBe(95);
  });

  it('sacrifica todo o PV restante quando o custo é maior', () => {
    const combat = create();
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.hitPoints.set(3);

    const result = combat.applyMark(enemy.id);

    expect(result).toMatchObject({ ok: true, cost: 3 });
    expect(combat.hitPoints()).toBe(0);
    expect(combat.enemies()[0]?.marks).toBe(1);
  });

  it('não marca com PV real em zero', () => {
    const combat = create();
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.hitPoints.set(0);

    const result = combat.applyMark(enemy.id);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('PV em zero');
    expect(combat.enemies()[0]?.marks).toBe(0);
  });

  it('devolve erro sem alvo válido e ignora nomes vazios', () => {
    const combat = create();

    expect(combat.addEnemy('  ')).toBeNull();
    expect(combat.applyMark('nao-existe').ok).toBe(false);
    combat.removeEnemy('nao-existe');
  });
});

describe('NeofitoCombat — custo progressivo em PV reais', () => {
  it('cobra 1 PV, depois 2 PV, e limita a dois rituais por turno', () => {
    const combat = create();
    configure(combat);

    const first = combat.castRitual('Ritual de Dano');

    expect(first).toMatchObject({ ok: true, cost: 1, damage: 2 });
    expect(combat.hitPoints()).toBe(109);
    expect(combat.ritualsThisTurn()).toBe(1);
    expect(combat.nextRitualCost()).toBe(2);

    const second = combat.castRitual('Ritual de Dano');

    expect(second).toMatchObject({ ok: true, cost: 2, damage: 2 });
    expect(combat.hitPoints()).toBe(107);

    const third = combat.castRitual('Ritual de Dano');

    expect(third.ok).toBe(false);
    expect(third.message).toContain('Limite de 2 rituais por turno');
    expect(combat.hitPoints()).toBe(107);

    combat.endTurn();

    expect(combat.nextRitualCost()).toBe(1);
    expect(combat.ritualsThisTurn()).toBe(0);
    expect(combat.round()).toBe(2);
    expect(combat.castRitual('Ritual de Dano')).toMatchObject({ ok: true, cost: 1 });
  });

  it('não limita rituais por turno na forma mascarada', () => {
    const combat = create('masked');
    configure(combat);

    expect(combat.ritualLimit).toBe(Number.POSITIVE_INFINITY);
    expect(combat.ritualLimitLabel).toBe('Sem limite por turno');

    expect(combat.castRitual('Ritual de Dano')).toMatchObject({ cost: 1 });
    expect(combat.castRitual('Ritual de Dano')).toMatchObject({ cost: 2 });
    expect(combat.castRitual('Ritual de Dano')).toMatchObject({ cost: 3 });

    expect(combat.ritualsThisTurn()).toBe(3);
    expect(combat.hitPoints()).toBe(190);
  });

  it('conclui o ritual mesmo quando o custo zera o PV real', () => {
    const combat = create('masked');
    configure(combat);
    combat.applyDamage(194);

    expect(combat.hitPoints()).toBe(2);

    const first = combat.castRitual('Ritual de Dano');

    expect(first).toMatchObject({ ok: true, cost: 1 });
    expect(combat.hitPoints()).toBe(1);

    const second = combat.castRitual('Ritual de Dano');

    expect(second).toMatchObject({ ok: true, cost: 1, damage: 2 });
    expect(combat.hitPoints()).toBe(0);
    expect(second.message).toContain('concluído');

    const blocked = combat.castRitual('Ritual de Dano');

    expect(blocked.ok).toBe(false);
    expect(blocked.message).toContain('PV em zero');
  });

  it('cura em PV temporários e não usa temporários para pagar rituais', () => {
    const combat = create();
    configure(combat);

    const heal = combat.castRitual('Ritual de Cura');

    expect(heal).toMatchObject({ ok: true, cost: 1, healing: 2, tempHitPoints: 2 });
    expect(combat.hitPoints()).toBe(109);
    expect(combat.tempHitPoints()).toBe(2);
    expect(combat.totalHitPoints()).toBe(111);

    const damage = combat.castRitual('Ritual de Dano');

    expect(damage).toMatchObject({ ok: true, cost: 2, damage: 2 });
    expect(combat.hitPoints()).toBe(107);
    expect(combat.tempHitPoints()).toBe(2);

    const received = combat.applyDamage(5);

    expect(received).toMatchObject({ ok: true, absorbed: 2, realDamage: 3 });
    expect(combat.tempHitPoints()).toBe(0);
    expect(combat.hitPoints()).toBe(104);
  });

  it('resolve o ritual híbrido com dano e cura na mesma conjuração', () => {
    const combat = create();
    configure(combat);

    const result = combat.castRitual('Ritual Híbrido');

    expect(result).toMatchObject({ ok: true, damage: 1, healing: 1, tempHitPoints: 1 });
    expect(combat.tempHitPoints()).toBe(1);
  });

  it('aplica o controle por rodadas configuradas', () => {
    const combat = create();
    configure(combat);

    const result = combat.castRitual('Ritual de Controle');

    expect(result.weakenedRounds).toBe(2);
    expect(combat.hitPoints()).toBe(109);
  });
});


describe('NeofitoCombat — Hemofagia', () => {
  it('exige alvo marcado e a escolha entre Absorção e Potencialização', () => {
    const combat = create();
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;

    const noMarks = combat.castRitual('Hemofagia', { choice: 'absorb' });

    expect(noMarks.ok).toBe(false);
    expect(noMarks.message).toBe('Hemofagia exige ao menos um alvo marcado.');

    combat.applyMark(enemy.id);

    const noChoice = combat.castRitual('Hemofagia');

    expect(noChoice.ok).toBe(false);
    expect(noChoice.message).toContain('Absorção e Potencialização');
    expect(combat.hitPoints()).toBe(105);
  });

  it('converte 50% do dano em PV temporários na Absorção', () => {
    const combat = create('masked');
    configure(combat);
    const first = combat.addEnemy('Cultista')!;
    const second = combat.addEnemy('Segurança')!;
    combat.applyMark(first.id);
    combat.applyMark(first.id);
    combat.applyMark(second.id);

    expect(combat.hitPoints()).toBe(181);

    const result = combat.castRitual('Hemofagia', { choice: 'absorb' });

    expect(result).toMatchObject({
      ok: true,
      ritual: 'Hemofagia',
      cost: 1,
      damage: 12,
      tempHitPoints: 6,
      marksConsumed: 3,
      choice: 'absorb',
    });
    expect(combat.hitPoints()).toBe(180);
    expect(combat.tempHitPoints()).toBe(6);
    expect(combat.markedEnemies()).toEqual([]);
    expect(combat.log()[0]?.title).toBe('Hemofagia');
  });

  it('guarda 50% do dano como bônus na Potencialização', () => {
    const combat = create('masked');
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);

    const hemofagia = combat.castRitual('Hemofagia', { choice: 'empower' });

    expect(hemofagia).toMatchObject({ ok: true, damage: 6, potentiation: 3 });
    expect(combat.pendingBonuses()).toEqual([
      { source: 'Potencialização (Hemofagia)', amount: 3 },
    ]);

    const damage = combat.castRitual('Ritual de Dano');

    expect(damage).toMatchObject({ ok: true, damage: 5 });
    expect(combat.pendingBonuses()).toEqual([]);
    expect(combat.hitPoints()).toBe(188);
  });

  it('preserva a Potencialização ao conjurar um ritual de controle', () => {
    const combat = create('masked');
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);
    combat.castRitual('Hemofagia', { choice: 'empower' });

    const control = combat.castRitual('Ritual de Controle');

    expect(control.weakenedRounds).toBe(2);
    expect(combat.pendingBonuses()).toHaveLength(1);
    expect(combat.pendingBonuses()[0]?.amount).toBe(3);
  });

  it('consome apenas as marcas dos alvos escolhidos', () => {
    const combat = create('masked');
    configure(combat);
    const first = combat.addEnemy('Cultista')!;
    const second = combat.addEnemy('Segurança')!;
    combat.applyMark(first.id);
    combat.applyMark(first.id);
    combat.applyMark(second.id);

    const result = combat.castRitual('Hemofagia', { choice: 'absorb', targets: [first.id] });

    expect(result).toMatchObject({ damage: 6, marksConsumed: 2 });
    expect(combat.enemies()[0]?.marks).toBe(0);
    expect(combat.enemies()[1]?.marks).toBe(1);
  });
});

describe('NeofitoCombat — habilidades de suporte', () => {
  it('exige configuração antes de sacrificar PV', () => {
    const combat = create();

    const result = combat.useSpecial('offering');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('defina custo em PV');
  });

  it('adiciona os dados configurados ao próximo ritual de dano', () => {
    const combat = create();
    configure(combat);

    const special = combat.useSpecial('offering');

    expect(special).toMatchObject({ ok: true, cost: 4, sacrificed: 4 });
    expect(combat.hitPoints()).toBe(106);
    expect(combat.pendingBonuses()).toHaveLength(1);

    const damage = combat.castRitual('Ritual de Dano');

    expect(damage.damage).toBe(4);
    expect(combat.pendingBonuses()).toEqual([]);
    expect(combat.hitPoints()).toBe(105);
  });

  it('não usa habilidades com PV real em zero', () => {
    const combat = create();
    configure(combat);
    combat.hitPoints.set(0);

    const result = combat.useSpecial('rite');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('PV em zero');
  });
});


describe('NeofitoCombat — Cartografia Carmesim', () => {
  it('só existe na forma mascarada', () => {
    const combat = create();
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);

    const result = combat.castCartography();

    expect(result.ok).toBe(false);
    expect(result.message).toContain('forma mascarada');
  });

  it('exige alvo marcado e configuração completa', () => {
    const combat = create('masked');
    const enemy = combat.addEnemy('Cultista')!;

    const noMarks = combat.castCartography();

    expect(noMarks.ok).toBe(false);
    expect(noMarks.message).toContain('ao menos um alvo marcado');

    combat.updateSettings((settings) => ({ ...settings, markCost: 5 }));
    combat.applyMark(enemy.id);

    const notConfigured = combat.castCartography();

    expect(notConfigured.ok).toBe(false);
    expect(notConfigured.message).toContain('Defina dano, sacrifício em PV');
    expect(combat.cartographyReady).toBe(false);
    expect(combat.hitPoints()).toBe(191);
  });

  it('atinge todos os marcados, gera PV temporários e fecha a cena', () => {
    const combat = create('masked');
    configure(combat);
    const first = combat.addEnemy('Cultista')!;
    const second = combat.addEnemy('Segurança')!;
    combat.applyMark(first.id);
    combat.applyMark(second.id);

    expect(combat.cartographyReady).toBe(true);
    expect(combat.hitPoints()).toBe(186);

    const result = combat.castCartography();

    expect(result).toMatchObject({
      ok: true,
      cost: 10,
      sacrificed: 10,
      damage: 4,
      healing: 1,
      tempHitPoints: 1,
      marksConsumed: 2,
      weakenedRounds: 2,
    });
    expect(combat.hitPoints()).toBe(176);
    expect(combat.tempHitPoints()).toBe(1);
    expect(combat.markedEnemies()).toEqual([]);
    expect(combat.sceneUsed()).toBe(true);
    expect(combat.log()[0]?.title).toBe('Cartografia Carmesim');

    const again = combat.castCartography();

    expect(again.ok).toBe(false);
    expect(again.message).toContain('já foi usada nesta cena');

    combat.newScene();

    expect(combat.sceneUsed()).toBe(false);
    expect(combat.ritualsThisTurn()).toBe(0);
    expect(combat.round()).toBe(1);
  });

  it('conclui a Cartografia mesmo quando o sacrifício zera o PV real', () => {
    const combat = create('masked');
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);
    combat.hitPoints.set(3);

    const result = combat.castCartography();

    expect(result).toMatchObject({ ok: true, cost: 3, sacrificed: 3, damage: 2 });
    expect(combat.hitPoints()).toBe(0);
    expect(combat.sceneUsed()).toBe(true);
  });

  it('não conjura com PV real em zero', () => {
    const combat = create('masked');
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);
    combat.hitPoints.set(0);

    const result = combat.castCartography();

    expect(result.ok).toBe(false);
    expect(result.message).toContain('PV em zero');
  });
});

describe('NeofitoCombat — fim de combate e configuração', () => {
  it('descarta PV temporários e preserva os PV reais', () => {
    const combat = create('masked');
    configure(combat);
    const enemy = combat.addEnemy('Cultista')!;
    combat.applyMark(enemy.id);
    combat.castRitual('Ritual de Cura');
    combat.useSpecial('offering');

    expect(combat.tempHitPoints()).toBe(2);
    expect(combat.pendingBonuses()).toHaveLength(1);

    combat.endCombat();

    expect(combat.hitPoints()).toBe(186);
    expect(combat.tempHitPoints()).toBe(0);
    expect(combat.pendingBonuses()).toEqual([]);
    expect(combat.enemies()).toEqual([]);
    expect(combat.ritualsThisTurn()).toBe(0);
    expect(combat.sceneUsed()).toBe(false);
    expect(combat.round()).toBe(1);
    expect(combat.log()[0]?.title).toBe('Combate encerrado');
  });

  it('reconhece a configuração completa de rituais, especiais e Cartografia', () => {
    const combat = create('masked');
    const damaRitual = combat.rituals[1]!;

    expect(combat.ritualReady(damaRitual)).toBe(false);
    expect(isCartographyConfigured(combat.settings())).toBe(false);

    configure(combat);

    expect(combat.rituals.every((ritual) => combat.ritualReady(ritual))).toBe(true);
    expect(isSpecialConfigured('offering', combat.settings())).toBe(true);
    expect(isSpecialConfigured('rite', combat.settings())).toBe(true);
    expect(isCartographyConfigured(combat.settings())).toBe(true);
    expect(combat.canCast(damaRitual)).toBe(true);
  });

  it('mantém no máximo 40 entradas no registro', () => {
    const combat = create();

    for (let index = 0; index < 45; index += 1) {
      combat.addEnemy(`Alvo ${index}`);
    }

    expect(combat.log()).toHaveLength(40);
  });
});

