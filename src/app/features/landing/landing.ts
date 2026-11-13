import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Character } from '../../core/character/character.model';
import { Atmosphere } from '../../shared/atmosphere/atmosphere';
import { AuthModal } from '../../shared/auth-modal/auth-modal';

@Component({
  selector: 'app-landing',
  imports: [Atmosphere, AuthModal],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /**
   * O botão abre a galeria. O modal de autenticação continua preservado para
   * quando as senhas forem reaproveitadas: `/?acesso=senha` abre o modal sem
   * alterar o fluxo principal da landing.
   */
  protected readonly portalOpen = signal(
    this.route.snapshot.queryParamMap.get('acesso') === 'senha',
  );

  protected chooseDestiny(): void {
    void this.router.navigate(['/galeria']);
  }

  protected closePortal(): void {
    this.portalOpen.set(false);

    if (this.route.snapshot.queryParamMap.has('acesso')) {
      void this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
  }

  protected enterDestiny(character: Character): void {
    this.portalOpen.set(false);
    void this.router.navigate(['/destino', character.slug]);
  }
}
