import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Character } from '../../core/character/character.model';
import { AuthModal } from './auth-modal';

describe('AuthModal', () => {
  let fixture: ComponentFixture<AuthModal>;
  let modal: AuthModal;
  let input: HTMLInputElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AuthModal] }).compileComponents();

    fixture = TestBed.createComponent(AuthModal);
    modal = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

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
    const element = fixture.nativeElement.querySelector('#auth-feedback') as HTMLElement;
    return element.textContent?.trim() ?? '';
  }

  it('expõe o título, a descrição e o campo solicitados', async () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#auth-title')?.textContent?.trim()).toBe('Qual é o seu destino?');
    expect(element.querySelector('#auth-description')?.textContent?.trim()).toBe(
      'O caminho foi escolhido. Resta saber se você está preparado.',
    );
    expect(input.placeholder).toBe('Digite sua senha...');
    expect(document.activeElement).toBe(input);
  });

  it('reconhece a senha sem diferenciar caixa, acentos ou espaços', () => {
    const authenticated: Character[] = [];
    modal.authenticated.subscribe((character) => authenticated.push(character));

    typePassword('  LÂMINA  ');
    submit();

    expect(authenticated).toHaveLength(1);
    expect(authenticated[0].name).toBe('Lia Kwon');
  });

  for (const [password, name] of [
    ['descontrole', 'Anne Kent'],
    ['loucura', 'David Moura'],
    ['lamina', 'Lia Kwon'],
    ['vazio', 'Cecília Nunes'],
    ['passado', 'Neófito'],
    ['abandonado', 'Artur Pires'],
  ] as const) {
    it(`reconhece a senha "${password}"`, () => {
      const authenticated: Character[] = [];
      modal.authenticated.subscribe((character) => authenticated.push(character));

      typePassword(password);
      submit();

      expect(authenticated.map((character) => character.name)).toEqual([name]);
      expect(feedback()).toBe('');
    });
  }

  it('mostra a mensagem discreta e marca o campo em caso de erro', () => {
    typePassword('destino errado');
    submit();

    expect(feedback()).toBe('Você ainda não encontrou o seu destino.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.auth__field--error')).toBeTruthy();

    typePassword('descontrole');

    expect(feedback()).toBe('');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('fecha pelo botão de fechar e restaura a rolagem da página', () => {
    vi.useFakeTimers();
    let dismissed = false;
    modal.dismissed.subscribe(() => (dismissed = true));

    (fixture.nativeElement.querySelector('.auth__close') as HTMLButtonElement).click();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(dismissed).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('fecha ao clicar fora do modal', () => {
    vi.useFakeTimers();
    let dismissed = false;
    modal.dismissed.subscribe(() => (dismissed = true));

    (fixture.nativeElement.querySelector('.auth') as HTMLElement).click();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(dismissed).toBe(true);
  });

  it('fecha ao pressionar Escape', () => {
    vi.useFakeTimers();
    let dismissed = false;
    modal.dismissed.subscribe(() => (dismissed = true));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(dismissed).toBe(true);
  });
});
