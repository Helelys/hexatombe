import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CharacterPortrait } from '../../core/character/character.model';
import { PORTRAIT_PLACEHOLDER_SRC } from '../../core/character/character-portraits';

/**
 * Retrato do destino: recorte de busto, moldura discreta e fallback automático.
 * A largura é definida pela ficha; aqui só vivem enquadramento e acabamento.
 */
@Component({
  selector: 'app-character-portrait',
  templateUrl: './character-portrait.html',
  styleUrl: './character-portrait.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.portrait--placeholder]': 'isPlaceholder()',
  },
})
export class CharacterPortraitView {
  readonly portrait = input.required<CharacterPortrait>();

  private readonly failedSrc = signal<string | null>(null);
  private readonly unavailableSrc = signal<string | null>(null);

  protected readonly fallbackSrc = computed(
    () => this.portrait().fallbackSrc ?? PORTRAIT_PLACEHOLDER_SRC,
  );

  protected readonly src = computed(() => {
    const { src } = this.portrait();

    return this.failedSrc() === src ? this.fallbackSrc() : src;
  });

  /** O avatar provisório é cinza sobre branco; recebe um tratamento escuro próprio. */
  protected readonly isPlaceholder = computed(() => this.src() === PORTRAIT_PLACEHOLDER_SRC);

  protected readonly visible = computed(() => this.unavailableSrc() !== this.portrait().src);

  protected handleError(): void {
    const { src } = this.portrait();

    if (this.failedSrc() !== src && src !== this.fallbackSrc()) {
      this.failedSrc.set(src);
      return;
    }

    // O próprio placeholder falhou: evita ícone quebrado e mantém só a moldura.
    this.unavailableSrc.set(src);
  }
}
