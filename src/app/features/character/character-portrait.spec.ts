import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterPortrait } from '../../core/character/character.model';
import {
  CHARACTER_PORTRAITS,
  PORTRAIT_PLACEHOLDER_SRC,
} from '../../core/character/character-portraits';
import { CharacterPortraitView } from './character-portrait';

describe('CharacterPortraitView', () => {
  let fixture: ComponentFixture<CharacterPortraitView>;

  function render(portrait: CharacterPortrait): void {
    fixture.componentRef.setInput('portrait', portrait);
    fixture.detectChanges();
  }

  function image(): HTMLImageElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '.portrait__image',
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterPortraitView],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterPortraitView);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('exibe o retrato recebido com a descrição acessível', () => {
    render({ src: '/portraits/anne-kent.webp', alt: 'Retrato de Anne Kent' });

    expect(image()?.getAttribute('src')).toBe('/portraits/anne-kent.webp');
    expect(image()?.getAttribute('alt')).toBe('Retrato de Anne Kent');
    expect((fixture.nativeElement as HTMLElement).classList).not.toContain('portrait--placeholder');
  });

  it('aplica o tratamento escuro ao avatar provisório', () => {
    render({ src: PORTRAIT_PLACEHOLDER_SRC, alt: 'Avatar provisório' });

    expect((fixture.nativeElement as HTMLElement).classList).toContain('portrait--placeholder');
  });

  it('entrega só a arte quando usado como pano de fundo', () => {
    fixture.componentRef.setInput('variant', 'bare');
    render(CHARACTER_PORTRAITS['anne-kent']);

    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList).toContain('portrait--bare');
    expect(host.classList).not.toContain('portrait--placeholder');
    expect(image()?.getAttribute('src')).toBe('https://i.imgur.com/4AugKVL.png');
    expect(image()?.getAttribute('alt')).toBe('Retrato de Anne Kent');
  });

  it('troca para o placeholder quando a imagem não carrega', () => {
    render({
      src: '/portraits/anne-kent.webp',
      alt: 'Retrato de Anne Kent',
      fallbackSrc: PORTRAIT_PLACEHOLDER_SRC,
    });

    image()?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image()?.getAttribute('src')).toBe(PORTRAIT_PLACEHOLDER_SRC);
    expect((fixture.nativeElement as HTMLElement).classList).toContain('portrait--placeholder');
  });

  it('mantém apenas a moldura quando o próprio placeholder falha', () => {
    render({
      src: PORTRAIT_PLACEHOLDER_SRC,
      alt: 'Retrato de Anne Kent',
      fallbackSrc: PORTRAIT_PLACEHOLDER_SRC,
    });

    image()?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.portrait')).toBeTruthy();
  });

  it('volta a tentar quando a ficha recebe outro retrato', () => {
    render({ src: '/portraits/anne-kent.webp', alt: 'Retrato de Anne Kent' });

    image()?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    render({ src: '/portraits/anne-kent-v2.webp', alt: 'Retrato de Anne Kent' });

    expect(image()?.getAttribute('src')).toBe('/portraits/anne-kent-v2.webp');
  });
});
