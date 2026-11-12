import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterEmblemVariant } from '../../core/character/character.model';
import { CharacterMotif } from './character-motif';

describe('CharacterMotif', () => {
  let fixture: ComponentFixture<CharacterMotif>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterMotif],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterMotif);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('não altera a composição original de Anne Kent', () => {
    expect(element.getAttribute('data-variant')).toBe('bulwark');
    expect(element.querySelector('svg')).toBeNull();
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('desenha um motivo gráfico exclusivo para cada personagem', () => {
    const variants: readonly CharacterEmblemVariant[] = ['ram', 'edge', 'sight', 'ritual', 'scrap'];
    const drawings = new Set<string>();

    for (const variant of variants) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      const svg = element.querySelector('svg');

      expect(element.getAttribute('data-variant')).toBe(variant);
      expect(svg).toBeTruthy();
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
      drawings.add(svg?.innerHTML ?? '');
    }

    expect(drawings.size).toBe(variants.length);
  });
});
