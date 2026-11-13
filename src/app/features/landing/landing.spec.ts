import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let element: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('mostra apenas o convite para escolher o destino', () => {
    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent?.trim()).toBe('Escolha seu destino');
    expect(element.querySelector('h1, h2, p, nav, footer')).toBeNull();
    expect(element.querySelector('app-auth-modal')).toBeNull();
  });

  it('leva à galeria de personagens ao escolher o destino', () => {
    (element.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/galeria']);
    expect(element.querySelector('app-auth-modal')).toBeNull();
  });
});

describe('Landing com o modal de autenticação preservado', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', component: Landing }])],
    }).compileComponents();
  });

  it('abre o modal pelo parâmetro de acesso', async () => {
    const harness = await RouterTestingHarness.create('/?acesso=senha');

    expect(harness.routeNativeElement?.querySelector('app-auth-modal')).toBeTruthy();
  });

  it('mantém a navegação para a ficha após validar a senha', async () => {
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    const harness = await RouterTestingHarness.create('/?acesso=senha');
    const input = harness.routeNativeElement?.querySelector(
      '#auth-password',
    ) as HTMLInputElement;
    const form = harness.routeNativeElement?.querySelector('form') as HTMLFormElement;

    input.value = 'descontrole';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/destino', 'anne-kent']);
  });
});
