import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterAbility } from '../../core/character/character.model';
import { CharacterAbilities } from './character-abilities';

const ABILITIES: readonly CharacterAbility[] = [
  {
    name: 'Base Plantada',
    action: 'Reação',
    limit: '1/rodada',
    description: 'Reduz o dano recebido.',
  },
  {
    name: 'Arranco',
    action: 'Padrão',
    cost: '2 PE',
    description: 'Empurra o alvo.',
  },
];

describe('CharacterAbilities', () => {
  let fixture: ComponentFixture<CharacterAbilities>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterAbilities],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterAbilities);
    fixture.componentRef.setInput('abilities', ABILITIES);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('empilha um bloco por habilidade', () => {
    const names = Array.from(element.querySelectorAll('.ability__name')).map((node) =>
      node.textContent?.trim(),
    );

    expect(names).toEqual(['Base Plantada', 'Arranco']);
  });

  it('numera as habilidades na ordem de leitura', () => {
    const indexes = Array.from(element.querySelectorAll('.ability__index')).map((node) =>
      node.textContent?.trim(),
    );

    expect(indexes).toEqual(['01', '02']);
  });

  it('omite custo e limite quando a habilidade não os possui', () => {
    const [first, second] = Array.from(element.querySelectorAll('.ability'));

    expect(first.querySelector('.ability__cost')).toBeNull();
    expect(first.querySelector('.ability__limit')?.textContent).toContain('1/rodada');
    expect(second.querySelector('.ability__cost')?.textContent).toContain('2 PE');
    expect(second.querySelector('.ability__limit')).toBeNull();
  });

  it('mantém a descrição de cada habilidade', () => {
    const descriptions = Array.from(element.querySelectorAll('.ability__description')).map((node) =>
      node.textContent?.trim(),
    );

    expect(descriptions).toEqual(['Reduz o dano recebido.', 'Empurra o alvo.']);
  });
});
