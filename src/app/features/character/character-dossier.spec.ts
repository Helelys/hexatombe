import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CHARACTERS } from '../../core/character/characters.data';
import { CharacterDossier } from '../../core/character/character.model';
import { CharacterDossierView } from './character-dossier';

const ANNE = CHARACTERS[0];
const DOSSIER = ANNE.dossier as CharacterDossier;

describe('CharacterDossierView', () => {
  let fixture: ComponentFixture<CharacterDossierView>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterDossierView],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterDossierView);
    fixture.componentRef.setInput('name', ANNE.name);
    fixture.componentRef.setInput('mood', ANNE.theme.mood);
    fixture.componentRef.setInput('dossier', DOSSIER);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('reúne nome, frase, atributos e habilidades na mesma ficha', () => {
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Anne Kent');
    expect(element.querySelector('h1')?.getAttribute('data-initial')).toBe('A');
    expect(element.querySelector('.oath__text')?.textContent).toContain(DOSSIER.quote);
    expect(element.querySelector('app-character-attributes')).toBeTruthy();
    expect(element.querySelector('app-character-abilities')).toBeTruthy();
  });

  it('expõe o humor e o emblema do personagem para as animações', () => {
    expect(element.getAttribute('data-mood')).toBe('tremor');
    expect(element.getAttribute('data-emblem')).toBe('bulwark');
  });

  it('mostra o retrato definido na ficha', () => {
    const image = element.querySelector<HTMLImageElement>('.dossier__portrait img');

    expect(DOSSIER.portrait).toBeDefined();
    expect(image?.getAttribute('src')).toBe(DOSSIER.portrait?.src);
    expect(image?.getAttribute('alt')).toBe(DOSSIER.portrait?.alt);
  });

  it('não reserva espaço quando a ficha não possui retrato', () => {
    fixture.componentRef.setInput('dossier', { ...DOSSIER, portrait: undefined });
    fixture.detectChanges();

    expect(element.querySelector('.dossier__portrait')).toBeNull();
  });

  it('volta ao placeholder quando a imagem do retrato falha', () => {
    fixture.componentRef.setInput('dossier', {
      ...DOSSIER,
      portrait: {
        src: '/portraits/anne-kent.webp',
        alt: 'Retrato de Anne Kent',
        fallbackSrc: '/portraits/placeholder.jpg',
      },
    });
    fixture.detectChanges();

    const image = element.querySelector<HTMLImageElement>('.dossier__portrait img');

    expect(image?.getAttribute('src')).toBe('/portraits/anne-kent.webp');

    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(
      element.querySelector<HTMLImageElement>('.dossier__portrait img')?.getAttribute('src'),
    ).toBe('/portraits/placeholder.jpg');
  });
});
