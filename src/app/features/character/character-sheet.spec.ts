import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CHARACTER_PORTRAITS } from '../../core/character/character-portraits';
import { CHARACTERS } from '../../core/character/characters.data';
import { Character } from '../../core/character/character.model';
import { MASKED_FORM_NOTE } from '../../core/character/masked-forms';
import {
  CharacterSheetView,
  resolveAbilityKind,
  resolveSheetCardKind,
  resolveSheetTone,
} from './character-sheet';

const ANNE = CHARACTERS[0];
const DAVID = CHARACTERS.find((character) => character.slug === 'david-moura') as Character;
const CECILIA = CHARACTERS.find((character) => character.slug === 'cecilia-nunes') as Character;
const LIA = CHARACTERS.find((character) => character.slug === 'lia-kwon') as Character;
const NEOFITO = CHARACTERS.find((character) => character.slug === 'neofito') as Character;

describe('CharacterSheetView', () => {
  let fixture: ComponentFixture<CharacterSheetView>;
  let element: HTMLElement;

  async function render(character: Character): Promise<void> {
    fixture.componentRef.setInput('character', character);
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  function text(selector: string): string {
    return element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  function pairs(selector: string): (string | undefined)[][] {
    return Array.from(element.querySelectorAll<HTMLElement>(selector)).map((item) => [
      item.dataset['key'],
      item.querySelector('dd')?.textContent?.trim(),
    ]);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterSheetView],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterSheetView);
    await render(ANNE);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('organiza a ficha em três áreas na ordem de leitura', () => {
    const areas = Array.from(element.querySelectorAll<HTMLElement>('.area'));

    expect(areas).toHaveLength(3);
    expect(
      areas.map(
        (area) =>
          area.querySelector('.area__title')?.textContent?.trim() ?? area.getAttribute('aria-label'),
      ),
    ).toEqual(['Identificação e informações gerais', 'Atributos', 'Ataques, habilidades e itens']);
  });

  it('separa ataques, habilidades e intenção e itens nesta ordem', () => {
    const sections = Array.from(
      element.querySelectorAll<HTMLElement>('.area--actions > .section'),
    );

    expect(sections).toHaveLength(3);
    expect(
      sections.map((section) => section.querySelector('.section__title')?.textContent?.trim()),
    ).toEqual(['Ataques', 'Habilidades e intenção', 'Itens']);
    expect(sections.map((section) => section.className)).toEqual([
      'section section--attacks',
      'section section--abilities',
      'section section--items',
    ]);
  });

  it('identifica tipo, categoria, VD e idade sob o nome', () => {
    expect(text('.identity__name')).toBe('Anne Kent');

    const meta = Array.from(element.querySelectorAll<HTMLElement>('.meta__item')).map((item) => [
      item.querySelector('dt')?.textContent?.trim(),
      item.querySelector('dd')?.textContent?.trim(),
    ]);

    expect(meta).toEqual([
      ['Tipo', 'Pessoa'],
      ['Categoria', 'Médio'],
      ['Arquétipo', 'Berserker'],
      ['VD', '80'],
      ['Idade', 'X'],
    ]);
  });

  it('exibe os sentidos lado a lado', () => {
    expect(pairs('.senses .cell')).toEqual([
      ['perception', '2d20+5'],
      ['initiative', '1d20+5'],
    ]);
  });

  it('destaca o valor da defesa', () => {
    expect(text('.defense__value')).toBe('24');
  });

  it('organiza as três resistências de forma compacta', () => {
    expect(pairs('.resistances .cell')).toEqual([
      ['fortitude', '4d20+10'],
      ['reflexes', '1d20+5'],
      ['will', '2d20+5'],
    ]);
  });

  it('mostra vitalidade com PV, machucado e PE máximo', () => {
    expect(pairs('.vitality .cell')).toEqual([
      ['hitPoints', '160'],
      ['wounded', '80'],
    ]);
    expect(text('.vitality__effort-label')).toBe('PE máximo');
    expect(text('.vitality__effort-value')).toBe('8');
  });

  it('informa o deslocamento', () => {
    expect(text('.speed__value')).toBe('9m');
  });

  it('lista as seis perícias com dados e modificador', () => {
    const skills = Array.from(element.querySelectorAll<HTMLElement>('.skill')).map((skill) => [
      skill.querySelector('.skill__name')?.textContent?.trim(),
      skill.querySelector('.skill__dice')?.textContent?.trim(),
      skill.querySelector('.skill__modifier')?.textContent?.trim(),
    ]);

    expect(skills).toHaveLength(6);
    expect(skills[0]).toEqual(['Atletismo', '4d20', '+10']);
    expect(skills[5]).toEqual(['Pilotagem', '1d20', '+5']);
    expect(element.querySelectorAll('.special .skill')).toHaveLength(0);
  });

  it('destaca a habilidade especial com limite e condições', () => {
    expect(text('.special__name')).toBe('Despertar a Máscara');
    expect(text('.special__tone')).toBe('◆ Padrão');
    expect(text('.special__description')).toBe('Não recupera PV ou PE. Não exige custo de recurso.');

    const facts = Array.from(element.querySelectorAll<HTMLElement>('.special .fact')).map(
      (fact) => [
        fact.querySelector('dt')?.textContent?.trim(),
        fact.querySelector('dd')?.textContent?.trim(),
      ],
    );

    expect(facts).toEqual([['Limite', 'Uma vez por cena']]);
  });

  it('mantém exclusivamente os cinco atributos na área central', () => {
    const center = element.querySelector<HTMLElement>('.area--attributes');
    const attributes = Array.from(center?.querySelectorAll<HTMLElement>('.attribute') ?? []).map(
      (attribute) => [
        attribute.dataset['key'],
        attribute.querySelector('.attribute__value')?.textContent?.trim(),
        attribute.querySelector('.attribute__label')?.textContent?.trim(),
      ],
    );

    expect(attributes).toEqual([
      ['AGI', '1', 'Agilidade'],
      ['FOR', '4', 'Força'],
      ['INT', '1', 'Intelecto'],
      ['PRE', '2', 'Presença'],
      ['VIG', '4', 'Vigor'],
    ]);
    expect(center?.querySelector('.skill')).toBeNull();
    expect(center?.querySelector('.cell')).toBeNull();
    expect(center?.querySelector('.move')).toBeNull();
  });

  it('preserva os valores corrigidos do Neófito no centro', async () => {
    await render(NEOFITO);

    const values = Array.from(element.querySelectorAll('.area--attributes .attribute__value')).map(
      (node) => node.textContent?.trim(),
    );

    expect(values).toEqual(['1', '1', '4', '4', '2']);
    expect(values).toEqual(NEOFITO.dossier?.attributes.map((attribute) => String(attribute.value)));
  });

  it('detalha os ataques com alcance, teste, dano e crítico', () => {
    const attack = element.querySelector<HTMLElement>('.move[data-kind="attack"]');

    expect(attack?.querySelector('.move__kind')?.textContent?.trim()).toBe('Ataque');
    expect(attack?.querySelector('.move__name')?.textContent?.trim()).toBe('Pancada');
    expect(attack?.querySelector('.move__description')?.textContent?.trim()).toBe(
      'Sem condições ou efeitos especiais.',
    );

    const facts = Array.from(attack?.querySelectorAll<HTMLElement>('.fact') ?? []).map((fact) => [
      fact.querySelector('dt')?.textContent?.trim(),
      fact.querySelector('dd')?.textContent?.trim(),
    ]);

    expect(facts).toEqual([
      ['Alcance', 'Corpo a corpo'],
      ['Teste', 'Luta 4d20+10'],
      ['Dano', '2d6+8'],
      ['Tipo', 'Impacto'],
      ['Crítico', '20/x2'],
    ]);
    expect(attack?.querySelector('.fact--damage dd')?.textContent?.trim()).toBe('2d6+8');
  });

  it('diferencia armas, rituais e habilidades de combate', async () => {
    await render(NEOFITO);

    const entries = Array.from(element.querySelectorAll<HTMLElement>('.move')).map((move) => [
      move.dataset['kind'],
      move.querySelector('.move__kind')?.textContent?.trim(),
      move.querySelector('.move__name')?.textContent?.trim(),
    ]);

    expect(entries).toEqual([
      ['ritual', 'Ritual de Sangue', 'Hemofagia'],
      ['ritual', 'Ritual de Sangue', 'Ritual de Dano'],
      ['ritual', 'Ritual de Sangue', 'Ritual de Cura'],
      ['ritual', 'Ritual de Sangue', 'Ritual de Controle'],
      ['ritual', 'Ritual de Sangue', 'Ritual Híbrido'],
      ['attack', 'Ataque', 'Golpe de Bastão'],
      ['combat', 'Habilidade de combate', 'Oferenda de Sangue'],
      ['combat', 'Habilidade de combate', 'Prece de Ferida'],
      ['combat', 'Habilidade de combate', 'Foco Ritual'],
    ]);
  });

  it('marca condições de uso sem mecânicas de ataque', async () => {
    await render(CECILIA);

    const condition = element.querySelector<HTMLElement>('.move[data-kind="condition"]');

    expect(condition?.querySelector('.move__kind')?.textContent?.trim()).toBe('Condição');
    expect(condition?.querySelector('.move__name')?.textContent?.trim()).toBe(
      'Restrição de Alcance',
    );
    expect(condition?.querySelector('.fact')).toBeNull();
  });

  it('não repete a habilidade especial entre as ações', () => {
    const names = Array.from(element.querySelectorAll('.move__name')).map((node) =>
      node.textContent?.trim(),
    );

    expect(names).not.toContain('Despertar a Máscara');
    expect(names).toEqual([
      'Pancada',
      'Combo de Punhos',
      'Casca Bruta',
      'Retaliação Furiosa',
      'Fúria Crescente',
    ]);
    expect(text('.special__name')).toBe('Despertar a Máscara');
  });

  it('mantém a intenção ao pé da ficha', () => {
    expect(text('.intent__label')).toBe('Intenção');
    expect(text('.intent__text')).toBe(ANNE.sheet?.intention);
  });

  it('preserva o retrato individual do personagem', () => {
    const portrait = element.querySelector<HTMLElement>('.identity__portrait');
    const image = portrait?.querySelector<HTMLImageElement>('.portrait__image');

    expect(portrait?.tagName.toLowerCase()).toBe('app-character-portrait');
    expect(image?.getAttribute('src')).toBe(CHARACTER_PORTRAITS['anne-kent'].src);
    expect(image?.getAttribute('alt')).toBe('Retrato de Anne Kent');
  });

  it('mantém a seção Itens independente dos ataques', async () => {
    await render(DAVID);

    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.section--items .item')).map((item) => [
        item.querySelector('.item__name')?.textContent?.trim(),
        item.querySelector('.item__type')?.textContent?.trim(),
      ]),
    ).toEqual([['Facão de Corte', 'Arma corpo a corpo']]);
    expect(element.querySelector('.section--items .move')).toBeNull();
    expect(element.querySelector('.section--attacks .item')).toBeNull();
    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.section--attacks .move__name')).map(
        (node) => node.textContent?.trim(),
      ),
    ).toEqual(['Facão de Corte', 'Abre-Guarda']);
  });

  it('mantém a seção Itens visível quando não há equipamento', () => {
    expect(text('.section--items .items__empty')).toBe('Sem itens registrados.');
    expect(element.querySelector('.section--items .item')).toBeNull();
  });

  it('coloca os rituais ofensivos em Ataques e as passivas em Habilidades', async () => {
    await render(NEOFITO);

    const names = (selector: string) =>
      Array.from(element.querySelectorAll<HTMLElement>(selector)).map((node) =>
        node.querySelector('.move__name')?.textContent?.trim(),
      );

    expect(names('.section--attacks .move')).toEqual([
      'Hemofagia',
      'Ritual de Dano',
      'Ritual de Cura',
      'Ritual de Controle',
      'Ritual Híbrido',
      'Golpe de Bastão',
    ]);
    expect(names('.section--abilities .move')).toEqual([
      'Oferenda de Sangue',
      'Prece de Ferida',
      'Foco Ritual',
    ]);
    expect(text('.section--attacks .move[data-kind="ritual"] .move__kind')).toBe(
      'Ritual de Sangue',
    );
  });

  it('não renderiza conteúdo sem ficha cadastrada', async () => {
    await render({ ...ANNE, sheet: undefined } as Character);

    expect(element.querySelector('.area')).toBeNull();
  });
});

describe('resolveSheetCardKind', () => {
  it('reconhece ataques, rituais, habilidades e condições', () => {
    expect(resolveSheetCardKind({ name: 'Pancada', test: 'Luta', damage: '2d6+8' })).toBe('attack');
    expect(
      resolveSheetCardKind({
        name: 'Estilhaço de Eco',
        category: 'Ritual de 2º círculo',
        action: 'Padrão',
      }),
    ).toBe('ritual');
    expect(resolveSheetCardKind({ name: 'Abre-Guarda', action: 'Padrão', cost: '2 PE' })).toBe(
      'combat',
    );
    expect(
      resolveSheetCardKind({ name: 'Restrição de Alcance', description: 'Sem alcance.' }),
    ).toBe('condition');
  });
});

describe('resolveSheetTone', () => {
  it('reconhece padrão, livre, reação, passiva e ritual', () => {
    expect(resolveSheetTone('Padrão')).toBe('standard');
    expect(resolveSheetTone('Ação livre')).toBe('free');
    expect(resolveSheetTone('Reação')).toBe('reaction');
    expect(resolveSheetTone('Passiva')).toBe('passive');
    expect(resolveSheetTone('Ritual')).toBe('ritual');
  });

  it('ignora acentos, caixa e registros ausentes', () => {
    expect(resolveSheetTone('REAÇÃO')).toBe('reaction');
    expect(resolveSheetTone('acao livre')).toBe('free');
    expect(resolveSheetTone(undefined)).toBe('neutral');
  });
});

describe('resolveAbilityKind', () => {
  it('separa rituais das demais habilidades', () => {
    expect(resolveAbilityKind({ name: 'Pilar de Aço', action: 'Passiva', description: '' })).toBe(
      'combat',
    );
    expect(
      resolveAbilityKind({
        name: 'Nó de Pensamento',
        category: 'Ritual de 2º círculo',
        action: 'Padrão',
        description: '',
      }),
    ).toBe('ritual');
  });
});

describe('CharacterSheetView — forma mascarada', () => {
  let fixture: ComponentFixture<CharacterSheetView>;
  let element: HTMLElement;

  async function render(character: Character): Promise<void> {
    fixture = TestBed.createComponent(CharacterSheetView);
    fixture.componentRef.setInput('character', character);
    fixture.componentRef.setInput('form', 'masked');
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  function text(selector: string): string {
    return element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  afterEach(() => {
    fixture.destroy();
  });

  it('identifica a forma mascarada como VD 140', async () => {
    await render(ANNE);

    const meta = Array.from(element.querySelectorAll<HTMLElement>('.meta__item')).map((item) => [
      item.querySelector('dt')?.textContent?.trim(),
      item.querySelector('dd')?.textContent?.trim(),
    ]);

    expect(meta).toEqual([
      ['Tipo', 'Pessoa'],
      ['Categoria', 'Médio'],
      ['Arquétipo', 'Berserker'],
      ['VD', '140'],
      ['Idade', 'X'],
      ['Máscara', 'O Lastro'],
    ]);
  });

  it('mantém a arte do personagem na forma mascarada', async () => {
    await render(ANNE);

    const image = element.querySelector<HTMLImageElement>('.identity__portrait img');

    expect(image?.getAttribute('src')).toBe(CHARACTER_PORTRAITS['anne-kent'].src);
    expect(image?.getAttribute('alt')).toBe('Retrato de Anne Kent');
  });

  it('mostra os valores máximos da transformação', async () => {
    await render(ANNE);

    expect(text('.defense__value')).toBe('31');
    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.vitality .cell')).map((cell) => [
        cell.dataset['key'],
        cell.querySelector('dd')?.textContent?.trim(),
      ]),
    ).toEqual([
      ['hitPoints', '280'],
      ['wounded', '140'],
    ]);
    expect(text('.vitality__effort-value')).toBe('10');
    expect(text('.speed__value')).toBe('9m');
  });

  it('usa os atributos da forma mascarada', async () => {
    await render(ANNE);

    const attributes = Array.from(element.querySelectorAll<HTMLElement>('.attribute')).map(
      (attribute) => [
        attribute.dataset['key'],
        attribute.querySelector('.attribute__value')?.textContent?.trim(),
      ],
    );

    expect(attributes).toEqual([
      ['AGI', '1'],
      ['FOR', '5'],
      ['INT', '1'],
      ['PRE', '2'],
      ['VIG', '5'],
    ]);
  });

  it('destaca o poder de intenção no lugar da habilidade especial', async () => {
    await render(ANNE);

    expect(text('.block.special .block__title')).toBe('Poder de intenção');
    expect(text('.special__name')).toBe('Fúria Inabalável');
    expect(text('.special__description')).toContain('RD 15');
  });

  it('lista ataques e habilidades da máscara, sem repetir a ficha comum', async () => {
    await render(ANNE);

    const entries = Array.from(element.querySelectorAll<HTMLElement>('.move')).map((move) => [
      move.dataset['kind'],
      move.querySelector('.move__name')?.textContent?.trim(),
    ]);

    expect(entries).toEqual([
      ['attack', 'Punhos de Fúria'],
      ['combat', 'Sequência Demolidora'],
      ['combat', 'RD de Monstro'],
      ['combat', 'Fúria Retaliatória'],
      ['combat', 'Carga Imparável'],
    ]);
    expect(text('.move__kind')).toBe('Ataque');
  });

  it('classifica os rituais da máscara pela categoria de sangue', async () => {
    await render(NEOFITO);

    const rituals = Array.from(element.querySelectorAll<HTMLElement>('.move[data-kind="ritual"]'));

    expect(rituals).toHaveLength(5);
    expect(rituals.map((move) => move.querySelector('.move__name')?.textContent?.trim())).toEqual([
      'Hemofagia',
      'Ritual de Dano',
      'Ritual de Cura',
      'Ritual de Controle',
      'Ritual Híbrido',
    ]);
    expect(rituals.map((move) => move.querySelector('.move__kind')?.textContent?.trim())).toEqual(
      Array.from({ length: 5 }, () => 'Ritual de Sangue'),
    );
  });

  it('traz a nota da transformação ao pé da ficha', async () => {
    await render(ANNE);

    expect(text('.intent__label')).toBe('Transformação');
    expect(text('.intent__text')).toBe(MASKED_FORM_NOTE);
  });

  it('mostra o equipamento da máscara na seção Itens', async () => {
    await render(DAVID);

    expect(
      Array.from(element.querySelectorAll<HTMLElement>('.section--items .item')).map((item) => [
        item.querySelector('.item__name')?.textContent?.trim(),
        item.querySelector('.item__type')?.textContent?.trim(),
      ]),
    ).toEqual([['Facão Gume', 'Arma corpo a corpo']]);
    expect(text('.section--items .section__title')).toBe('Itens');
  });

  it('mantém o poder de intenção dentro da seção de habilidades', async () => {
    await render(ANNE);

    expect(text('.section--abilities .special__name')).toBe('Fúria Inabalável');
    expect(element.querySelector('.section--attacks .special__name')).toBeNull();
  });

  it('marca a ficha como mascarada para o tema visual', async () => {
    await render(ANNE);

    expect(element.getAttribute('data-form')).toBe('masked');
  });

  it('volta à ficha comum quando a forma não é mascarada', async () => {
    await render(ANNE);
    fixture.componentRef.setInput('form', 'common');
    fixture.detectChanges();

    expect(element.getAttribute('data-form')).toBe('common');
    expect(text('.defense__value')).toBe('24');
    expect(text('.special__name')).toBe('Despertar a Máscara');
    expect(text('.intent__label')).toBe('Intenção');
  });

  it('monta a mesa de combate apenas para Lia e Neófito', async () => {
    await render(LIA);

    expect(element.querySelector('app-lia-combat-console.combat')).not.toBeNull();
    expect(element.querySelector('app-neofito-combat-console')).toBeNull();

    await render(NEOFITO);

    expect(element.querySelector('app-neofito-combat-console.combat')).not.toBeNull();
    expect(element.querySelector('app-lia-combat-console')).toBeNull();

    await render(ANNE);

    expect(element.querySelector('.combat')).toBeNull();
  });

});
