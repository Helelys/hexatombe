import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('mostra apenas o convite para escolher o destino', () => {
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent?.trim()).toBe('Escolha seu destino');
    expect(element.querySelector('h1, h2, p, nav, footer')).toBeNull();
    expect(element.querySelector('app-auth-modal')).toBeNull();
  });

  it('abre o modal de autenticação ao escolher o destino', () => {
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-auth-modal')).toBeTruthy();
  });
});
