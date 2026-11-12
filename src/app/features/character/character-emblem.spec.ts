import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterEmblemVariant } from '../../core/character/character.model';
import { CharacterEmblem } from './character-emblem';

describe('CharacterEmblem', () => {
  let fixture: ComponentFixture<CharacterEmblem>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterEmblem],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterEmblem);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('desenha a variante padrão como um símbolo fechado', () => {
    expect(element.getAttribute('data-variant')).toBe('bulwark');
    expect(element.querySelectorAll('svg path').length).toBeGreaterThan(0);
    expect(element.querySelectorAll('svg circle').length).toBeGreaterThan(0);
  });

  it('é puramente decorativo para leitores de tela', () => {
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('cria um símbolo exclusivo para cada personagem', () => {
    const variants: readonly CharacterEmblemVariant[] = [
      'bulwark',
      'ram',
      'edge',
      'sight',
      'ritual',
      'scrap',
    ];
    const symbols = new Set<string>();

    for (const variant of variants) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      const svg = element.querySelector('svg');

      expect(element.getAttribute('data-variant')).toBe(variant);
      expect(svg).toBeTruthy();
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
      symbols.add(`${svg?.getAttribute('class')}|${svg?.innerHTML.length}`);
    }

    expect(symbols.size).toBe(variants.length);
  });
});
