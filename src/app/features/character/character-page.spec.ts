import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CHARACTER_PORTRAITS } from '../../core/character/character-portraits';
import { CHARACTERS } from '../../core/character/characters.data';
import { Character } from '../../core/character/character.model';
import { CharacterPage } from './character-page';

describe('CharacterPage', () => {
  let fixture: ComponentFixture<CharacterPage>;
  let element: HTMLElement;

  function render(character: Character): void {
    fixture.componentRef.setInput('character', character);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterPage);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('apresenta o nome e a frase de Anne Kent', () => {
    render(CHARACTERS[0]);

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Anne Kent');
    expect(element.querySelector('.oath__text')?.textContent).toContain(
      'Se alguém precisa ficar de pé, serei eu.',
    );
  });

  it('exibe os cinco atributos com os valores da personagem', () => {
    render(CHARACTERS[0]);

    const attributes = Array.from(element.querySelectorAll('.attribute')).map((node) => [
      node.getAttribute('data-key'),
      node.querySelector('.attribute__number')?.textContent?.trim(),
      node.querySelector('.attribute__label')?.textContent?.trim(),
    ]);

    expect(attributes).toEqual([
      ['AGI', '1', 'Agilidade'],
      ['FOR', '4', 'Força'],
      ['INT', '1', 'Intelecto'],
      ['PRE', '2', 'Presença'],
      ['VIG', '4', 'Vigor'],
    ]);
  });

  it('apresenta o símbolo central da ficha', () => {
    render(CHARACTERS[0]);

    const emblem = element.querySelector('app-character-emblem');

    expect(emblem?.getAttribute('data-variant')).toBe('bulwark');
    expect(emblem?.querySelector('svg')).toBeTruthy();
  });

  it('lista as três habilidades com tipo, custo e limite', () => {
    render(CHARACTERS[0]);

    const abilities = Array.from(element.querySelectorAll<HTMLElement>('.ability'));
    const names = abilities.map((ability) =>
      ability.querySelector('.ability__name')?.textContent?.trim(),
    );
    const metas = abilities.map((ability) =>
      ability.querySelector('.ability__meta')?.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(names).toEqual(['Casca Bruta', 'Retaliação Furiosa', 'Fúria Crescente']);
    expect(metas[0]).toContain('Passiva');
    expect(metas[0]).not.toContain('Custo');
    expect(metas[1]).toContain('Reação');
    expect(metas[1]).toContain('Limite: 1/rodada');
    expect(metas[2]).toContain('Passiva');
  });

  it('mantém as descrições originais das habilidades', () => {
    render(CHARACTERS[0]);

    const descriptions = Array.from(element.querySelectorAll('.ability__description')).map(
      (description) => description.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(descriptions).toEqual([
      'Anne recebe RD 5 contra dano físico.',
      'Ao sofrer dano corpo a corpo, reduz o dano em 1d10+4. O agressor faz Fortitude DT 20 ou é empurrado 1,5 m.',
      'Ao perder PV, seu próximo ataque de punhos até o fim do próximo turno causa +1d8. Uma vez por rodada.',
    ]);
  });

  it('apresenta a arte oficial do personagem', () => {
    render(CHARACTERS[0]);

    const image = element.querySelector<HTMLImageElement>('.dossier__portrait img');

    expect(image?.getAttribute('src')).toBe(CHARACTER_PORTRAITS['anne-kent'].src);
    expect(image?.getAttribute('alt')).toBe('Retrato de Anne Kent');
  });

  it('mantém a página essencial para personagens sem ficha', () => {
    render({ ...CHARACTERS[1], dossier: undefined });

    expect(element.querySelector('.dossier')).toBeNull();
    expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe('David Moura');
  });

  it('apresenta cada personagem com sua própria ficha completa', () => {
    for (const character of CHARACTERS) {
      render(character);

      expect(element.querySelector('h1')?.textContent?.trim()).toBe(character.name);
      expect(element.querySelector('.oath__text')?.textContent).toContain(character.dossier?.quote);
      expect(element.querySelectorAll('.attribute')).toHaveLength(5);
      expect(element.querySelectorAll('.ability')).toHaveLength(3);

      const portrait = element.querySelector<HTMLImageElement>('.dossier__portrait img');

      expect(portrait?.getAttribute('src')).toBe(character.dossier?.portrait?.src);
      expect(portrait?.getAttribute('alt')).toBe(character.dossier?.portrait?.alt);

      const emblem = element.querySelector('app-character-emblem');

      expect(emblem?.getAttribute('data-variant')).toBe(character.dossier?.emblem);
      expect(element.querySelector('app-character-motif')?.getAttribute('data-variant')).toBe(
        character.dossier?.emblem,
      );
    }
  });

  it('assume a identidade visual do personagem', () => {
    render(CHARACTERS[0]);

    const page = element.querySelector('.destiny-page') as HTMLElement;

    expect(page.dataset['mood']).toBe('tremor');
    expect(page.classList).toContain('destiny-page--dossier');
  });

  it('permite retornar à galeria de personagens', () => {
    render(CHARACTERS[0]);

    const link = element.querySelector('a.return') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/galeria');
    expect(link.getAttribute('aria-label')).toBe('Retornar à galeria');
  });

  it('oferece a ficha completa em todos os destinos', () => {
    for (const character of CHARACTERS) {
      render(character);

      const link = element.querySelector('.sheet-call__button') as HTMLAnchorElement;

      expect(link.textContent?.trim()).toBe('Ver ficha completa');
      expect(link.getAttribute('href')).toBe(`/destino/${character.slug}/ficha`);
      expect(element.querySelector('.sheet-call__hint')?.textContent?.trim()).toBe(
        'Requer a senha deste destino.',
      );
    }
  });

  it('não anuncia ficha completa para personagens sem ficha', () => {
    render({ ...CHARACTERS[0], sheet: undefined });

    expect(element.querySelector('.sheet-call')).toBeNull();
  });

  it('leva a ficha completa para uma página própria, sem diálogo', () => {
    render(CHARACTERS[0]);

    const link = element.querySelector('.sheet-call__button') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/destino/anne-kent/ficha');
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(element.querySelector('app-character-sheet')).toBeNull();
  });
});
