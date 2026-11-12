import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

    expect(names).toEqual(['Base Plantada', 'Arranco', 'Ombro de Guarda']);
    expect(metas[0]).toContain('Reação');
    expect(metas[0]).toContain('Limite: 1/rodada');
    expect(metas[1]).toContain('Padrão');
    expect(metas[1]).toContain('Custo: 2 PE');
    expect(metas[2]).toContain('Livre');
    expect(metas[2]).toContain('Custo: 1 PE');
  });

  it('mantém as descrições originais das habilidades', () => {
    render(CHARACTERS[0]);

    const descriptions = Array.from(element.querySelectorAll('.ability__description')).map(
      (description) => description.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(descriptions).toEqual([
      'Ao sofrer dano de um ataque corpo a corpo, reduz o dano em 1d10+4. Se não se deslocou no turno anterior, reduz mais 3.',
      'Após acertar Pancada, empurra o alvo 3 m. Se ele colidir com uma superfície, sofre +1d8 impacto. Fortitude DT 20 evita o deslocamento.',
      'Escolhe um aliado adjacente; ele recebe +2 Defesa até o início do próximo turno de Anne. Uma vez por rodada.',
    ]);
  });

  it('não exibe ilustração enquanto a personagem não possui arte', () => {
    render(CHARACTERS[0]);

    expect(element.querySelector('.dossier__portrait')).toBeNull();
    expect(element.querySelector('.dossier img')).toBeNull();
  });

  it('mantém a página essencial para personagens sem ficha', () => {
    render(CHARACTERS[1]);

    expect(element.querySelector('.dossier')).toBeNull();
    expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe('David Moura');
  });

  it('assume a identidade visual do personagem', () => {
    render(CHARACTERS[0]);

    const page = element.querySelector('.destiny-page') as HTMLElement;

    expect(page.dataset['mood']).toBe('tremor');
    expect(page.classList).toContain('destiny-page--dossier');
  });

  it('permite retornar ao portal', () => {
    render(CHARACTERS[0]);

    const link = element.querySelector('a.return') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/');
    expect(link.getAttribute('aria-label')).toBe('Retornar ao portal');
  });
});

