import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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

  protected readonly portalOpen = signal(false);

  protected openPortal(): void {
    this.portalOpen.set(true);
  }

  protected closePortal(): void {
    this.portalOpen.set(false);
  }

  protected enterDestiny(character: Character): void {
    this.portalOpen.set(false);
    void this.router.navigate(['/destino', character.slug]);
  }
}
