import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CHARACTERS } from '../../core/character/characters.data';
import { Gallery } from './gallery';

describe('Gallery', () => {
  let fixture: ComponentFixture<Gallery>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('apresenta o título e a frase da galeria', () => {
    expect(element.querySelector('.gallery__title')?.textContent?.trim()).toBe(
      'ESCOLHA SEU PERSONAGEM',
    );
    expect(element.querySelector('.gallery__intro')?.textContent?.trim()).toBe(
      'Seis destinos. Seis caminhos. Uma única escolha.',
    );
  });

  it('lista os seis personagens na ordem do registro', () => {
    const names = Array.from(element.querySelectorAll('.card__name')).map((name) =>
      name.textContent?.trim(),
    );

    expect(element.querySelectorAll('a.card')).toHaveLength(6);
    expect(names).toEqual(CHARACTERS.map((character) => character.name));
  });

  it('leva cada card à rota individual do personagem', () => {
    const hrefs = Array.from(element.querySelectorAll('a.card')).map((card) =>
      card.getAttribute('href'),
    );

    expect(hrefs).toEqual(CHARACTERS.map((character) => `/destino/${character.slug}`));
  });

  it('reaproveita o emblema e o motivo de cada ficha', () => {
    const cards = Array.from(element.querySelectorAll<HTMLElement>('a.card'));

    cards.forEach((card, index) => {
      const emblem = CHARACTERS[index].dossier?.emblem;

      expect(card.dataset['emblem']).toBe(emblem);
      expect(card.querySelector('app-character-emblem')?.getAttribute('data-variant')).toBe(
        emblem,
      );
      expect(card.querySelector('app-character-motif')?.getAttribute('data-variant')).toBe(
        emblem,
      );
    });
  });

  it('assume a identidade visual de cada personagem', () => {
    const cards = Array.from(element.querySelectorAll<HTMLElement>('a.card'));

    cards.forEach((card, index) => {
      expect(card.style.getPropertyValue('--character-accent')).toBe(
        CHARACTERS[index].theme.accent,
      );
    });
  });

  it('indica que o card é clicável', () => {
    const card = element.querySelector('a.card') as HTMLAnchorElement;

    expect(card.textContent).toContain('Abrir ficha');
    expect(card.querySelector('.card__emblem')).toBeTruthy();
  });

  it('oferece retorno ao portal', () => {
    const link = element.querySelector('a.gallery__return') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/');
    expect(link.getAttribute('aria-label')).toBe('Retornar ao portal');
  });
});
