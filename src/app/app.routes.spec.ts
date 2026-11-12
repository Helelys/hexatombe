import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('rotas', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();
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

  it('redireciona um slug desconhecido para o portal', async () => {
    await RouterTestingHarness.create('/destino/inexistente');

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('redireciona qualquer rota desconhecida para o portal', async () => {
    await RouterTestingHarness.create('/lugar/nenhum');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
