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
    expect(element.querySelector('.oath__text')?.textContent).toContain(DOSSIER.quote);
    expect(element.querySelector('app-character-attributes')).toBeTruthy();
    expect(element.querySelector('app-character-abilities')).toBeTruthy();
  });

  it('expõe o humor do personagem para as animações', () => {
    expect(element.getAttribute('data-mood')).toBe('tremor');
  });

  it('não reserva espaço para arte enquanto ela não existe', () => {
    expect(DOSSIER.portrait).toBeUndefined();
    expect(element.querySelector('.dossier__portrait')).toBeNull();
  });

  it('mostra a ilustração quando a ficha passa a ter arte', () => {
    fixture.componentRef.setInput('dossier', {
      ...DOSSIER,
      portrait: { src: '/assets/anne-kent.webp', alt: 'Retrato de Anne Kent' },
    });
    fixture.detectChanges();

    const image = element.querySelector<HTMLImageElement>('.dossier__portrait img');

    expect(image?.getAttribute('src')).toBe('/assets/anne-kent.webp');
    expect(image?.getAttribute('alt')).toBe('Retrato de Anne Kent');
  });
});
