import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CHARACTERS } from '../../core/character/characters.data';
import { Character } from '../../core/character/character.model';
import { MASK_ACCESS_KEY, MaskAccess } from '../../core/character/mask-access';
import { SHEET_ACCESS_KEY, SheetAccess } from '../../core/character/sheet-access';
import { SheetForm } from './character-sheet';
import { CharacterSheetPage } from './character-sheet-page';

const ANNE = CHARACTERS[0];

describe('CharacterSheetPage', () => {
  let fixture: ComponentFixture<CharacterSheetPage>;
  let element: HTMLElement;
  let input: HTMLInputElement;
  let form: HTMLFormElement;

  async function render(character: Character, mode: SheetForm = 'common'): Promise<void> {
    fixture.componentRef.setInput('character', character);
    fixture.componentRef.setInput('form', mode);
    fixture.detectChanges();
    // Executa os ganchos `afterNextRender` (foco inicial no campo de senha).
    TestBed.tick();

    element = fixture.nativeElement as HTMLElement;
    input = element.querySelector('input') as HTMLInputElement;
    form = element.querySelector('form') as HTMLFormElement;
  }

  function typePassword(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  function feedback(): string {
    return element.querySelector('#sheet-feedback')?.textContent?.trim() ?? '';
  }

  function storedSlugs(): string[] {
    return JSON.parse(sessionStorage.getItem(SHEET_ACCESS_KEY) ?? '[]') as string[];
  }

  function maskSlugs(): string[] {
    return JSON.parse(sessionStorage.getItem(MASK_ACCESS_KEY) ?? '[]') as string[];
  }

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CharacterSheetPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterSheetPage);
    await render(ANNE);
  });

  afterEach(() => {
    fixture.destroy();
    sessionStorage.clear();
  });

  it('abre em uma página inteira, sem modal nem diálogo', () => {
    expect(element.querySelector('.sheet-page')).toBeTruthy();
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(element.querySelector('app-character-sheet')).toBeNull();
    expect(element.querySelector('.lock__title')?.textContent?.trim()).toBe('A ficha está selada');
    expect(element.querySelector('.sheet')).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('oferece o caminho de volta para a página do personagem', () => {
    const back = element.querySelector('.sheet-page__back') as HTMLAnchorElement;

    expect(back.getAttribute('href')).toBe('/destino/anne-kent');
    expect(back.getAttribute('aria-label')).toBe('Voltar para a página de Anne Kent');
    expect(back.textContent?.trim()).toBe('Voltar');
  });

  it('recusa a senha errada e mantém a ficha selada', () => {
    typePassword('destino errado');
    submit();

    expect(feedback()).toBe('Esta senha não abre esta ficha.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('.lock__field--error')).toBeTruthy();
    expect(element.querySelector('.sheet')).toBeNull();
  });

  it('limpa o erro assim que a senha é corrigida', () => {
    typePassword('destino errado');
    submit();

    typePassword('descontrole');

    expect(feedback()).toBe('');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('recusa a senha de outro destino', () => {
    typePassword('loucura');
    submit();

    expect(feedback()).toBe('Esta senha não abre esta ficha.');
    expect(element.querySelector('.sheet')).toBeNull();
    expect(storedSlugs()).toEqual([]);
  });

  it('revela a ficha na própria página com a senha do personagem', async () => {
    typePassword('  DESCONTROLE  ');
    submit();

    expect(element.querySelector('.lock')).toBeNull();
    expect(element.querySelector('.sheet')).toBeTruthy();
    expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe('Anne Kent');
    expect(element.querySelector('.intent__text')?.textContent).toContain('Intenção Adormecida');

    const revealed = await new Promise<Element | null>((resolve) =>
      setTimeout(() => resolve(document.activeElement), 20),
    );

    expect(revealed).toBe(element.querySelector('.sheet-page__body'));
  });

  it('guarda a liberação para a ficha continuar aberta após recarregar', () => {
    typePassword('descontrole');
    submit();

    expect(storedSlugs()).toEqual(['anne-kent']);

    // Uma instância nova representa o recarregamento da página.
    const reloaded = new SheetAccess();

    expect(reloaded.isUnlocked('anne-kent')).toBe(true);
    expect(reloaded.isUnlocked('david-moura')).toBe(false);
  });

  it('oferece o botão da transformação na ficha comum aberta', () => {
    typePassword('descontrole');
    submit();

    const call = element.querySelector('.mask-call') as HTMLAnchorElement;

    expect(call.getAttribute('href')).toBe('/destino/anne-kent/mascara');
    expect(call.textContent?.trim()).toBe('Colocar a máscara');
    expect(element.querySelector('.mask-call--retire')).toBeNull();
  });

  it('não oferece a máscara enquanto a ficha está selada', () => {
    expect(element.querySelector('.mask-call')).toBeNull();
  });

  it('pede a senha da transformação com a máscara ainda selada', async () => {
    await render(ANNE, 'masked');

    expect(element.querySelector('.lock__title')?.textContent?.trim()).toBe(
      'A máscara está selada',
    );
    expect(element.querySelector('.mask-banner__text')?.textContent?.trim()).toBe(
      'FORMA MASCARADA',
    );
    expect(element.querySelector('.mask-banner__grade')?.textContent?.trim()).toBe('VD 140');
    expect(element.querySelector('.sheet')).toBeNull();
    expect(element.querySelector('.mask-call')).toBeNull();
  });

  it('desperta a forma mascarada com a senha única da transformação', async () => {
    await render(ANNE, 'masked');

    typePassword('  MÁSCARA ');
    submit();

    expect(element.querySelector('.lock')).toBeNull();
    expect(element.querySelector('.sheet')).toBeTruthy();
    expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe('Anne Kent');
    expect(element.querySelector('.defense__value')?.textContent?.trim()).toBe('31');
    expect(
      element.querySelector('.meta__item[data-key="mask"] .meta__value')?.textContent?.trim(),
    ).toBe('O Lastro');
    expect(maskSlugs()).toEqual(['anne-kent']);
    expect(storedSlugs()).toEqual([]);
  });

  it('recusa a senha individual da ficha comum na transformação', async () => {
    await render(ANNE, 'masked');

    typePassword('descontrole');
    submit();

    expect(feedback()).toBe('Esta senha não desperta a máscara.');
    expect(element.querySelector('.sheet')).toBeNull();
    expect(maskSlugs()).toEqual([]);
  });

  it('recusa senhas erradas na transformação', async () => {
    await render(ANNE, 'masked');

    typePassword('mascara errada');
    submit();

    expect(feedback()).toBe('Esta senha não desperta a máscara.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('.lock__field--error')).toBeTruthy();
  });

  it('mantém a máscara aberta após recarregar', async () => {
    await render(ANNE, 'masked');

    typePassword('mascara');
    submit();

    // Uma instância nova representa o recarregamento da página.
    const reloaded = new MaskAccess();

    expect(reloaded.isUnlocked('anne-kent')).toBe(true);
    expect(reloaded.isUnlocked('david-moura')).toBe(false);
  });

  it('retorna à ficha comum sem pedir a senha de novo', async () => {
    await render(ANNE, 'masked');

    typePassword('mascara');
    submit();

    const back = element.querySelector('.sheet-page__back') as HTMLAnchorElement;
    const retire = element.querySelector('.mask-call--retire') as HTMLAnchorElement;

    expect(back.getAttribute('href')).toBe('/destino/anne-kent/ficha');
    expect(back.textContent?.trim()).toBe('Forma comum');
    expect(back.getAttribute('aria-label')).toBe(
      'Retirar a máscara e voltar à ficha comum de Anne Kent',
    );
    expect(retire.getAttribute('href')).toBe('/destino/anne-kent/ficha');
    expect(retire.textContent?.trim()).toBe('Retirar a máscara');
  });

  for (const character of CHARACTERS) {
    it(`abre a ficha de ${character.name} apenas com a senha dele`, async () => {
      await render(character);

      typePassword(character.password);
      submit();

      expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe(character.name);
      expect(element.querySelector('.sheet')).toBeTruthy();
    });

    it(`desperta a máscara de ${character.name} com a senha única`, async () => {
      await render(character, 'masked');

      typePassword('mascara');
      submit();

      expect(element.querySelector('.identity__name')?.textContent?.trim()).toBe(character.name);
      expect(element.querySelector('.defense__value')?.textContent?.trim()).toBe(
        character.maskedForm?.sheet.defense,
      );
      expect(
        element.querySelector('.meta__item[data-key="mask"] .meta__value')?.textContent?.trim(),
      ).toBe(character.maskedForm?.name);
      expect(maskSlugs()).toEqual([character.slug]);
    });
  }
});
