import { CharacterSheet, CharacterSheetAction } from './character.model';
import { CHARACTER_SHEETS, DORMANT_INTENTION } from './character-sheets';
import { CHARACTERS } from './characters.data';
import { NEOFITO_RITUAL_CATEGORY } from './combat/neofito-rituals';

const SHEETS: readonly CharacterSheet[] = Object.values(CHARACTER_SHEETS);

describe('CHARACTER_SHEETS', () => {
  it('cobre exatamente os seis destinos cadastrados', () => {
    expect(Object.keys(CHARACTER_SHEETS).sort()).toEqual(
      CHARACTERS.map((character) => character.slug).sort(),
    );
  });

  it('fica disponível em todos os personagens do portal', () => {
    for (const character of CHARACTERS) {
      expect(character.sheet).toBeDefined();
      expect(character.sheet).toBe(
        CHARACTER_SHEETS[character.slug as keyof typeof CHARACTER_SHEETS],
      );
    }
  });

  it('mantém a idade desconhecida em todas as fichas', () => {
    for (const sheet of SHEETS) {
      expect(sheet.age).toBe('X');
    }
  });

  it('descreve defesas, pontos e deslocamento em formato de jogo', () => {
    for (const sheet of SHEETS) {
      expect(sheet.defense).toMatch(/^\d+$/);
      expect(sheet.hitPoints).toMatch(/^\d+$/);
      expect(sheet.wounded).toMatch(/^\d+$/);
      expect(sheet.effortPoints).toMatch(/^\d+$/);
      expect(sheet.speed).toMatch(/^\d+m$/);

      expect(sheet.fortitude).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.reflexes).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.will).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.perception).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.initiative).toMatch(/^\d+d20\+\d+$/);

      expect(sheet.intention).toBe(DORMANT_INTENTION);
    }
  });

  it('mantém o limiar de machucado abaixo dos pontos de vida', () => {
    for (const sheet of SHEETS) {
      expect(Number(sheet.wounded)).toBeLessThan(Number(sheet.hitPoints));
    }
  });

  it('lista seis perícias com dados e modificador', () => {
    for (const sheet of SHEETS) {
      expect(sheet.skills).toHaveLength(6);

      for (const skill of sheet.skills) {
        expect(skill.name.length).toBeGreaterThan(0);
        expect(skill.dice).toMatch(/^\d+d20$/);
        expect(skill.modifier).toMatch(/^\+\d+$/);
      }
    }
  });

  it('registra um ataque com teste, dano e tipo em cada ficha', () => {
    for (const sheet of SHEETS) {
      const attack = sheet.actions.find((action) => action.test && action.damage);

      expect(attack).toBeDefined();
      expect(attack?.damageType).toBeDefined();

      if (attack?.critical) {
        expect(attack.critical).toMatch(/^\d+\/x\d+$/);
      }
    }
  });

  it('identifica o arquétipo de cada destino', () => {
    expect(SHEETS.map((sheet) => sheet.archetype)).toEqual([
      'Berserker',
      'Combatente',
      'Assassina',
      'Atirador',
      'Ocultista',
      'Sacrifício',
    ]);
  });

  it('mantém o Despertar a Máscara selado em todos os destinos', () => {
    for (const sheet of SHEETS) {
      const dormant = sheet.actions.find((action) => action.name === 'Despertar a Máscara');

      expect(dormant).toBeDefined();
      expect(dormant?.action).toBe('Padrão');
      expect(dormant?.cost).toBeUndefined();
      expect(dormant?.limit).toBe('Uma vez por cena');
      expect(dormant?.description).toBe('Não recupera PV ou PE. Não exige custo de recurso.');
    }
  });

  it('descreve os rituais de sangue do Neófito', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS.neofito.actions;
    const rituals = actions.filter((action) => action.category);

    expect(rituals.map((ritual) => ritual.name)).toEqual([
      'Hemofagia',
      'Ritual de Dano',
      'Ritual de Cura',
      'Ritual de Controle',
      'Ritual Híbrido',
    ]);
    expect(rituals.every((ritual) => ritual.category === NEOFITO_RITUAL_CATEGORY)).toBe(true);
    expect(rituals.every((ritual) => ritual.cost === 'PV real (progressivo por turno)')).toBe(true);

    const hemofagia = rituals[0];

    expect(hemofagia?.damage).toBe('4d8');
    expect(hemofagia?.damageType).toBe('Sangue');
    expect(hemofagia?.mechanics?.kind).toBe('hemofagia');
  });

  it('deixa o custo dos rituais configuráveis na mesa de combate', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS.neofito.actions;
    const configured = actions.filter((action) => action.mechanics?.kind === 'ritual');

    expect(configured).toHaveLength(4);
    expect(configured.every((action) => action.damage === undefined)).toBe(true);
  });

  it('substitui o Paradoxo pelo Golpe de Bastão na ficha comum do Neófito', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS.neofito.actions;
    const names = actions.map((action) => action.name);

    expect(names).toEqual([
      'Hemofagia',
      'Ritual de Dano',
      'Ritual de Cura',
      'Ritual de Controle',
      'Ritual Híbrido',
      'Golpe de Bastão',
      'Despertar a Máscara',
    ]);
    expect(names).not.toContain('Paradoxo');

    const strike = actions.find((action) => action.name === 'Golpe de Bastão');

    expect(strike?.category).toBeUndefined();
    expect(strike?.range).toBe('Corpo a corpo');
    expect(strike?.test).toBe('Luta 1d20');
    expect(strike?.damage).toBe('1d8+5');
    expect(strike?.damageType).toBe('Impacto');
    expect(strike?.critical).toBe('20/x2');
  });

  it('usa os valores aprovados da Lia na ficha comum', () => {
    const sheet = CHARACTER_SHEETS['lia-kwon'];
    const katana = sheet.actions.find((action) => action.name === 'Katana');
    const shuriken = sheet.actions.find((action) => action.name === 'Shuriken de Tendão');

    expect(sheet.archetype).toBe('Assassina');
    expect(sheet.defense).toBe('23');
    expect(sheet.hitPoints).toBe('75');
    expect(sheet.wounded).toBe('37');
    expect(katana?.mechanics).toEqual({ kind: 'weapon', hemorrhageLevels: 1 });
    expect(shuriken?.mechanics).toEqual({ kind: 'barrage', hemorrhageLevels: 1, throws: 3 });
  });

  it('registra a restrição de alcance de Cecília sem atributos de ataque', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS['cecilia-nunes'].actions;
    const restriction = actions.find((action) => action.name === 'Restrição de Alcance');

    expect(restriction).toBeDefined();
    expect(restriction?.test).toBeUndefined();
    expect(restriction?.damage).toBeUndefined();
    expect(restriction?.description).toContain('pelo menos 9 m');
  });

  it('mantém a intenção adormecida idêntica em todo o portal', () => {
    expect(DORMANT_INTENTION).toBe(
      'Intenção Adormecida: poder próprio liberado apenas ao assumir a forma mascarada.',
    );
  });
});
