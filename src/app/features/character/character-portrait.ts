import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CharacterPortrait } from '../../core/character/character.model';
import { PORTRAIT_PLACEHOLDER_SRC } from '../../core/character/character-portraits';

/**
 * `frame` desenha a moldura do documento; `bare` entrega só a arte, para a
 * galeria usar a ilustração como pano de fundo do card.
 */
export type PortraitVariant = 'frame' | 'bare';

/**
 * Retrato do destino: arte inteira, moldura discreta e fallback automático.
 * A largura é definida por quem usa o componente; aqui só vivem enquadramento,
 * acabamento e a variante sem moldura.
 */
@Component({
  selector: 'app-character-portrait',
  templateUrl: './character-portrait.html',
  styleUrl: './character-portrait.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.portrait--placeholder]': 'isPlaceholder()',
    '[class.portrait--bare]': "variant() === 'bare'",
  },
})
export class CharacterPortraitView {
  readonly portrait = input.required<CharacterPortrait>();
  readonly variant = input<PortraitVariant>('frame');

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
