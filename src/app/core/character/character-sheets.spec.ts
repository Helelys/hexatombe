import { CharacterSheet, CharacterSheetAction } from './character.model';
import { CHARACTER_SHEETS, DORMANT_INTENTION } from './character-sheets';
import { CHARACTERS } from './characters.data';

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
      expect(attack?.critical).toMatch(/^\d+\/x\d+$/);
    }
  });

  it('mantém o Despertar a Máscara selado em todos os destinos', () => {
    for (const sheet of SHEETS) {
      const dormant = sheet.actions.find((action) => action.name === 'Despertar a Máscara');

      expect(dormant).toBeDefined();
      expect(dormant?.action).toBe('Padrão');
      expect(dormant?.cost).toBe('2 PE');
      expect(dormant?.limit).toBe('Uma vez por cena');
      expect(dormant?.description).toBe('Não recupera PV ou PE.');
    }
  });

  it('descreve o ritual do Neófito com círculo e resistência', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS.neofito.actions;
    const ritual = actions.find((action) => action.category);

    expect(ritual?.name).toBe('Estilhaço de Eco');
    expect(ritual?.category).toBe('Ritual de 2º círculo');
    expect(ritual?.test).toBe('Reflexos DT 20');
    expect(ritual?.damage).toBe('4d6');
  });

  it('registra a restrição de alcance de Cecília sem atributos de ataque', () => {
    const actions: readonly CharacterSheetAction[] = CHARACTER_SHEETS['cecilia-nunes'].actions;
    const restriction = actions.find((action) => action.name === 'Restrição de Alcance');

    expect(restriction).toBeDefined();
    expect(restriction?.test).toBeUndefined();
    expect(restriction?.damage).toBeUndefined();
    expect(restriction?.description).toContain('pelo menos 9m');
  });

  it('mantém a intenção adormecida idêntica em todo o portal', () => {
    expect(DORMANT_INTENTION).toBe(
      'Intenção Adormecida: poder próprio liberado apenas ao assumir a forma mascarada.',
    );
  });
});
