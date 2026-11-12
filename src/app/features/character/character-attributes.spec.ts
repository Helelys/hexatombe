import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ATTRIBUTE_LABELS, CharacterAttribute } from '../../core/character/character.model';
import { CharacterAttributes } from './character-attributes';

const ATTRIBUTES: readonly CharacterAttribute[] = [
  { key: 'AGI', value: 1 },
  { key: 'FOR', value: 4 },
  { key: 'INT', value: 1 },
  { key: 'PRE', value: 2 },
  { key: 'VIG', value: 4 },
];

describe('CharacterAttributes', () => {
  let fixture: ComponentFixture<CharacterAttributes>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterAttributes],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterAttributes);
    fixture.componentRef.setInput('attributes', ATTRIBUTES);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('distribui os cinco atributos na ordem da ficha', () => {
    const keys = Array.from(element.querySelectorAll('.attribute')).map((node) =>
      node.getAttribute('data-key'),
    );

    expect(keys).toEqual(['AGI', 'FOR', 'INT', 'PRE', 'VIG']);
  });

  it('mostra o valor em destaque e o nome completo do atributo', () => {
    const rows = Array.from(element.querySelectorAll('.attribute')).map((node) => [
      node.querySelector('.attribute__number')?.textContent?.trim(),
      node.querySelector('.attribute__label')?.textContent?.trim(),
    ]);

    expect(rows).toEqual(
      ATTRIBUTES.map((attribute) => [String(attribute.value), ATTRIBUTE_LABELS[attribute.key]]),
    );
  });

  it('centraliza o emblema da personagem', () => {
    expect(element.querySelector('app-character-emblem svg')).toBeTruthy();
    expect(element.querySelector('.attributes__stage')).toBeTruthy();
  });

  it('liga cada atributo ao emblema por um traço', () => {
    expect(element.querySelectorAll('.attributes__links-main path')).toHaveLength(
      ATTRIBUTES.length,
    );
    expect(element.querySelectorAll('.attributes__links-echo path')).toHaveLength(
      ATTRIBUTES.length,
    );
    expect(element.querySelectorAll('.attributes__beads circle')).toHaveLength(ATTRIBUTES.length);
  });
});
