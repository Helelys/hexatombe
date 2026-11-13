import { CharacterAbility, MaskedForm } from './character.model';
import { MASKED_FORMS, MASKED_FORM_NOTE, MASKED_GRADE } from './masked-forms';
import { CHARACTERS } from './characters.data';

const FORMS: readonly MaskedForm[] = Object.values(MASKED_FORMS);

describe('MASKED_FORMS', () => {
  it('cobre exatamente os seis destinos cadastrados', () => {
    expect(Object.keys(MASKED_FORMS).sort()).toEqual(
      CHARACTERS.map((character) => character.slug).sort(),
    );
  });

  it('fica disponível em todos os personagens do portal', () => {
    for (const character of CHARACTERS) {
      expect(character.maskedForm).toBeDefined();
      expect(character.maskedForm).toBe(MASKED_FORMS[character.slug as keyof typeof MASKED_FORMS]);
    }
  });

  it('identifica cada máscara com nome próprio e VD 140', () => {
    for (const [slug, form] of Object.entries(MASKED_FORMS)) {
      expect(slug.length).toBeGreaterThan(0);
      expect(form.name.length).toBeGreaterThan(0);
      expect(form.grade).toBe(MASKED_GRADE);
      expect(form.grade).toBe('140');
    }
  });

  it('guarda os valores máximos da transformação em formato de jogo', () => {
    for (const form of FORMS) {
      const sheet = form.sheet;

      expect(sheet.age).toBe('X');
      expect(sheet.defense).toMatch(/^\d+$/);
      expect(sheet.hitPoints).toMatch(/^\d+$/);
      expect(sheet.wounded).toMatch(/^\d+$/);
      expect(sheet.effortPoints).toMatch(/^\d+$/);
      expect(sheet.speed).toMatch(/^\d+m$/);

      expect(sheet.perception).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.initiative).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.fortitude).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.reflexes).toMatch(/^\d+d20\+\d+$/);
      expect(sheet.will).toMatch(/^\d+d20\+\d+$/);
    }
  });

  it('mantém o machucado na metade dos PV máximos', () => {
    for (const form of FORMS) {
      expect(Number(form.sheet.wounded)).toBe(Number(form.sheet.hitPoints) / 2);
    }
  });

  it('não recupera PV nem PE: o esforço é compartilhado entre as formas', () => {
    for (const form of FORMS) {
      expect(form.sheet.intention).toBe(MASKED_FORM_NOTE);
    }

    expect(MASKED_FORM_NOTE).toContain('não recupera PV nem PE');
    expect(MASKED_FORM_NOTE).toContain('compartilhado');
  });

  it('lista seis perícias e os cinco atributos em cada forma', () => {
    for (const form of FORMS) {
      expect(form.sheet.skills).toHaveLength(6);
      expect(form.attributes.map((attribute) => attribute.key)).toEqual([
        'AGI',
        'FOR',
        'INT',
        'PRE',
        'VIG',
      ]);

      for (const attribute of form.attributes) {
        expect(attribute.value).toBeGreaterThan(0);
      }

      for (const skill of form.sheet.skills) {
        expect(skill.name.length).toBeGreaterThan(0);
        expect(skill.dice).toMatch(/^\d+d20$/);
        expect(skill.modifier).toMatch(/^\+\d+$/);
      }
    }
  });

  it('registra ataques, habilidades e o poder de intenção', () => {
    for (const form of FORMS) {
      const attack = form.sheet.actions.find(
        (action) => action.test && action.damage && action.critical,
      );

      expect(attack).toBeDefined();
      expect(attack?.damageType).toBeDefined();
      expect(form.abilities).toHaveLength(3);

      expect(form.intention.name.length).toBeGreaterThan(0);
      expect(form.intention.action).toBeDefined();
      expect(form.intention.description.length).toBeGreaterThan(20);
    }
  });

  it('traz os dados do documento para cada máscara', () => {
    expect(MASKED_FORMS['anne-kent'].name).toBe('O Lastro');
    expect(MASKED_FORMS['anne-kent'].sheet.hitPoints).toBe('280');
    expect(MASKED_FORMS['anne-kent'].sheet.defense).toBe('31');
    expect(MASKED_FORMS['anne-kent'].sheet.effortPoints).toBe('10');
    expect(MASKED_FORMS['anne-kent'].intention.name).toBe('Fúria Inabalável');

    expect(MASKED_FORMS['david-moura'].name).toBe('Gume');
    expect(MASKED_FORMS['david-moura'].sheet.hitPoints).toBe('230');
    expect(MASKED_FORMS['david-moura'].sheet.skills[3]).toEqual({
      name: 'Luta',
      dice: '5d20',
      modifier: '+20',
    });
    expect(MASKED_FORMS['david-moura'].intention.name).toBe('Corte de Sentença');

    expect(MASKED_FORMS['lia-kwon'].name).toBe('Risco');
    expect(MASKED_FORMS['lia-kwon'].sheet.hitPoints).toBe('166');
    expect(MASKED_FORMS['lia-kwon'].sheet.speed).toBe('12m');
    expect(MASKED_FORMS['lia-kwon'].intention.name).toBe('Marca na Garganta');

    expect(MASKED_FORMS['cecilia-nunes'].name).toBe('Vigília');
    expect(MASKED_FORMS['cecilia-nunes'].sheet.hitPoints).toBe('180');
    expect(MASKED_FORMS['cecilia-nunes'].sheet.skills[0]).toEqual({
      name: 'Pontaria',
      dice: '4d20',
      modifier: '+20',
    });
    expect(MASKED_FORMS['cecilia-nunes'].intention.name).toBe('Ângulo Impossível');

    expect(MASKED_FORMS.neofito.name).toBe('Cartógrafo');
    expect(MASKED_FORMS.neofito.sheet.hitPoints).toBe('196');
    expect(MASKED_FORMS.neofito.sheet.effortPoints).toBe('18');
    expect(MASKED_FORMS.neofito.intention.name).toBe('Geometria do Pavor');

    expect(MASKED_FORMS['artur-pires'].name).toBe('Espólio');
    expect(MASKED_FORMS['artur-pires'].sheet.hitPoints).toBe('200');
    expect(MASKED_FORMS['artur-pires'].sheet.actions).toHaveLength(3);
    expect(MASKED_FORMS['artur-pires'].intention.name).toBe('Herança Final');
  });

  it('descreve os rituais do Cartógrafo com o círculo e a resistência', () => {
    const abilities: readonly CharacterAbility[] = MASKED_FORMS.neofito.abilities;
    const rituals = abilities.filter((ability) => ability.category);

    expect(rituals).toHaveLength(2);

    for (const ritual of rituals) {
      expect(ritual.category).toBe('Ritual de 2º círculo');
      expect(ritual.cost).toBe('3 PE');
    }

    expect(rituals[1]?.description).toContain('4d8 Sangue');
    expect(rituals[0]?.name).toBe('Nó de Pensamento');
    expect(rituals[1]?.name).toBe('Poeira Hemática');
  });
});
