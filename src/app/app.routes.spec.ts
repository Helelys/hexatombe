import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MASK_ACCESS_KEY } from './core/character/mask-access';
import { SHEET_ACCESS_KEY } from './core/character/sheet-access';
import { routes } from './app.routes';

describe('rotas', () => {
  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('resolve o personagem pelo slug da rota', async () => {
    const harness = await RouterTestingHarness.create('/destino/cecilia-nunes');
    const heading = harness.routeNativeElement?.querySelector('h1');

    expect(heading?.textContent?.trim()).toBe('Cecília Nunes');
    expect(heading?.dataset['initial']).toBe('C');
    expect(harness.routeNativeElement?.querySelector('.destiny-page')?.className).toContain(
      'destiny-page',
    );
  });

  const destinations = [
    ['anne-kent', 'Anne Kent', 'A'],
    ['david-moura', 'David Moura', 'D'],
    ['lia-kwon', 'Lia Kwon', 'L'],
    ['cecilia-nunes', 'Cecília Nunes', 'C'],
    ['neofito', 'Neófito', 'N'],
    ['artur-pires', 'Artur Pires', 'A'],
  ] as const;

  for (const [slug, name, initial] of destinations) {
    it(`abre a ficha de ${name}`, async () => {
      const harness = await RouterTestingHarness.create(`/destino/${slug}`);
      const heading = harness.routeNativeElement?.querySelector('h1');

      expect(heading?.textContent?.trim()).toBe(name);
      expect(heading?.dataset['initial']).toBe(initial);
      expect(harness.routeNativeElement?.querySelector('.dossier')).toBeTruthy();
    });
  }

  it('redireciona um slug desconhecido para a galeria', async () => {
    await RouterTestingHarness.create('/destino/inexistente');

    expect(TestBed.inject(Router).url).toBe('/galeria');
  });

  it('abre a ficha completa em uma página própria, ainda selada', async () => {
    const harness = await RouterTestingHarness.create('/destino/anne-kent/ficha');
    const page = harness.routeNativeElement;

    expect(TestBed.inject(Router).url).toBe('/destino/anne-kent/ficha');
    expect(page?.querySelector('.sheet-page')).toBeTruthy();
    expect(page?.querySelector('[role="dialog"]')).toBeNull();
    expect(page?.querySelector('.lock__title')?.textContent?.trim()).toBe('A ficha está selada');
    expect(page?.querySelector('.sheet')).toBeNull();
  });

  it('mantém a ficha visível ao recarregar a rota já liberada', async () => {
    sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify(['anne-kent']));

    const harness = await RouterTestingHarness.create('/destino/anne-kent/ficha');

    expect(harness.routeNativeElement?.querySelector('.identity__name')?.textContent?.trim()).toBe(
      'Anne Kent',
    );
    expect(harness.routeNativeElement?.querySelector('.sheet')).toBeTruthy();
  });

  it('leva o botão da página individual à ficha do personagem', async () => {
    const harness = await RouterTestingHarness.create('/destino/anne-kent');
    const link = harness.routeNativeElement?.querySelector('.sheet-call__button');

    expect(link?.getAttribute('href')).toBe('/destino/anne-kent/ficha');

    (link as HTMLAnchorElement).click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/destino/anne-kent/ficha');
    expect(harness.routeNativeElement?.querySelector('.sheet-page')).toBeTruthy();
  });

  it('redireciona a ficha de um slug desconhecido para a galeria', async () => {
    await RouterTestingHarness.create('/destino/inexistente/ficha');

    expect(TestBed.inject(Router).url).toBe('/galeria');
  });

  it('abre a forma mascarada em página própria, ainda selada', async () => {
    const harness = await RouterTestingHarness.create('/destino/anne-kent/mascara');
    const page = harness.routeNativeElement;

    expect(TestBed.inject(Router).url).toBe('/destino/anne-kent/mascara');
    expect(page?.querySelector('[role="dialog"]')).toBeNull();
    expect(page?.querySelector('.lock__title')?.textContent?.trim()).toBe('A máscara está selada');
    expect(page?.querySelector('.mask-banner__text')?.textContent?.trim()).toBe('FORMA MASCARADA');
    expect(page?.querySelector('.mask-banner__grade')?.textContent?.trim()).toBe('VD 140');
    expect(page?.querySelector('.sheet')).toBeNull();
  });

  it('mantém a forma mascarada visível ao recarregar a rota já liberada', async () => {
    sessionStorage.setItem(MASK_ACCESS_KEY, JSON.stringify(['anne-kent']));

    const harness = await RouterTestingHarness.create('/destino/anne-kent/mascara');
    const page = harness.routeNativeElement;

    expect(page?.querySelector('.defense__value')?.textContent?.trim()).toBe('31');
    expect(page?.querySelector('.meta__item[data-key="mask"]')?.textContent).toContain('O Lastro');
    expect(page?.querySelector('.mask-call--retire')?.getAttribute('href')).toBe(
      '/destino/anne-kent/ficha',
    );
  });

  it('leva o botão da ficha comum à forma mascarada', async () => {
    sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify(['anne-kent']));

    const harness = await RouterTestingHarness.create('/destino/anne-kent/ficha');
    const call = harness.routeNativeElement?.querySelector('.mask-call') as HTMLAnchorElement;

    expect(call.textContent?.trim()).toBe('Colocar a máscara');
    expect(call.getAttribute('href')).toBe('/destino/anne-kent/mascara');

    call.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/destino/anne-kent/mascara');
    expect(harness.routeNativeElement?.querySelector('.lock__title')?.textContent?.trim()).toBe(
      'A máscara está selada',
    );
  });

  it('retira a máscara e volta à ficha comum já liberada', async () => {
    sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify(['anne-kent']));
    sessionStorage.setItem(MASK_ACCESS_KEY, JSON.stringify(['anne-kent']));

    const harness = await RouterTestingHarness.create('/destino/anne-kent/mascara');
    const back = harness.routeNativeElement?.querySelector(
      '.sheet-page__back',
    ) as HTMLAnchorElement;

    expect(back.getAttribute('href')).toBe('/destino/anne-kent/ficha');

    back.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/destino/anne-kent/ficha');
    expect(harness.routeNativeElement?.querySelector('.identity__name')?.textContent?.trim()).toBe(
      'Anne Kent',
    );
    expect(harness.routeNativeElement?.querySelector('.sheet')).toBeTruthy();
  });

  it('redireciona a máscara de um slug desconhecido para a galeria', async () => {
    await RouterTestingHarness.create('/destino/inexistente/mascara');

    expect(TestBed.inject(Router).url).toBe('/galeria');
  });

  it('abre a galeria com os seis destinos', async () => {
    const harness = await RouterTestingHarness.create('/galeria');
    const title = harness.routeNativeElement?.querySelector('.gallery__title');

    expect(title?.textContent?.trim()).toBe('ESCOLHA SEU PERSONAGEM');
    expect(harness.routeNativeElement?.querySelectorAll('a.card')).toHaveLength(6);
  });

  it('leva da landing à galeria ao escolher o destino', async () => {
    const harness = await RouterTestingHarness.create('/');
    const button = harness.routeNativeElement?.querySelector('.destiny') as HTMLButtonElement;

    button.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/galeria');
    expect(harness.routeNativeElement?.querySelector('.gallery__title')).toBeTruthy();
  });

  it('redireciona qualquer rota desconhecida para o portal', async () => {
    await RouterTestingHarness.create('/lugar/nenhum');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
