import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
