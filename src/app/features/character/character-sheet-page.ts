import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CharacterDirectory } from '../../core/character/character-directory';
import { Character } from '../../core/character/character.model';
import { SHEET_IDENTITY } from '../../core/character/character-sheets';
import { MaskAccess, isMaskedFormPassword } from '../../core/character/mask-access';
import { SheetAccess } from '../../core/character/sheet-access';
import { Atmosphere } from '../../shared/atmosphere/atmosphere';
import { CharacterSheetView, SheetForm } from './character-sheet';

/**
 * Página exclusiva da ficha completa.
 *
 * A ficha ocupa a tela inteira (sem modal) e continua selada até a senha do
 * próprio personagem ser digitada. A liberação fica guardada na sessão, então
 * recarregar a página mantém a ficha visível.
 *
 * A mesma página serve à forma mascarada (`form = 'masked'`): ali o selo pede a
 * senha única da transformação, independente da senha do destino, e a ficha
 * VD 140 abre com a estrutura da ficha comum.
 */
@Component({
  selector: 'app-character-sheet-page',
  imports: [ReactiveFormsModule, RouterLink, Atmosphere, CharacterSheetView],
  templateUrl: './character-sheet-page.html',
  styleUrl: './character-sheet-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--character-accent]': 'character().theme.accent',
    '[style.--character-glow]': 'character().theme.glow',
    '[attr.data-mood]': 'character().theme.mood',
  },
})
export class CharacterSheetPage {
  private readonly directory = inject(CharacterDirectory);
  private readonly access = inject(SheetAccess);
  private readonly masks = inject(MaskAccess);
  private readonly destroyRef = inject(DestroyRef);

  readonly character = input.required<Character>();
  /** `masked` abre a forma mascarada (VD 140) no lugar da ficha comum. */
  readonly form = input<SheetForm>('common');

  /** Forma mascarada em exibição; nula na ficha comum. */
  protected readonly masked = computed(() =>
    this.form() === 'masked' ? (this.character().maskedForm ?? null) : null,
  );

  protected readonly grade = computed(() => this.masked()?.grade ?? SHEET_IDENTITY.grade);
  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly hasError = signal(false);
  protected readonly isShaking = signal(false);

  /** Cada forma tem o próprio selo: a ficha comum e a máscara não se misturam. */
  protected readonly unlocked = computed(() => {
    const slug = this.character().slug;

    return this.masked() ? this.masks.isUnlocked(slug) : this.access.isUnlocked(slug);
  });

  /** A ficha comum é o caminho de volta; a máscara, o despertar. */
  protected readonly backLink = computed(() => {
    const slug = this.character().slug;

    return this.masked() ? ['/destino', slug, 'ficha'] : ['/destino', slug];
  });

  protected readonly backLabel = computed(() => (this.masked() ? 'Forma comum' : 'Voltar'));

  protected readonly backAria = computed(() =>
    this.masked()
      ? `Retirar a máscara e voltar à ficha comum de ${this.character().name}`
      : `Voltar para a página de ${this.character().name}`,
  );

  /** Rota própria da transformação, aberta a partir da ficha comum. */
  protected readonly maskLink = computed(() => ['/destino', this.character().slug, 'mascara']);

  /** Nem todo destino possui forma mascarada cadastrada. */
  protected readonly hasMask = computed(() => this.character().maskedForm !== undefined);

  protected readonly eyebrow = computed(() =>
    this.masked() ? 'Forma mascarada' : 'Ficha completa',
  );

  protected readonly heading = computed(() =>
    this.masked()
      ? `${this.character().name} — forma mascarada`
      : `${this.character().name} — ficha completa`,
  );

  protected readonly lockTitle = computed(() =>
    this.masked() ? 'A máscara está selada' : 'A ficha está selada',
  );

  protected readonly lockDescription = computed(() =>
    this.masked()
      ? `Diga a senha da transformação para despertar ${this.masked()?.name ?? 'a forma mascarada'}.`
      : `${this.character().name} só se revela a quem carrega a senha deste destino.`,
  );

  protected readonly lockLabel = computed(() =>
    this.masked()
      ? `Senha da máscara de ${this.character().name}`
      : `Senha de ${this.character().name}`,
  );

  protected readonly lockAction = computed(() =>
    this.masked() ? 'Despertar a máscara' : 'Revelar ficha',
  );

  protected readonly errorMessage = computed(() =>
    this.masked() ? 'Esta senha não desperta a máscara.' : 'Esta senha não abre esta ficha.',
  );

  protected readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  protected readonly sheetRegion = viewChild<ElementRef<HTMLElement>>('sheetRegion');

  private shakeTimer: ReturnType<typeof setTimeout> | undefined;
  private focusTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      if (!this.unlocked()) {
        this.passwordInput()?.nativeElement.focus();
      }
    });

    this.destroyRef.onDestroy(() => {
      for (const timer of [this.shakeTimer, this.focusTimer]) {
        if (timer) {
          clearTimeout(timer);
        }
      }
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();

    if (this.unlocked()) {
      return;
    }

    if (this.masked()) {
      this.submitMask();
      return;
    }

    const character = this.directory.findByPassword(this.password.value);

    if (!character || character.slug !== this.character().slug) {
      this.reject();
      return;
    }

    this.reveal(() => this.access.unlock(this.character().slug));
  }

  protected clearError(): void {
    if (this.hasError()) {
      this.hasError.set(false);
    }
  }

  /**
   * A transformação tem senha própria: a senha do destino não desperta a
   * máscara e a senha da máscara não abre a ficha comum.
   */
  private submitMask(): void {
    if (!isMaskedFormPassword(this.password.value)) {
      this.reject();
      return;
    }

    this.reveal(() => this.masks.unlock(this.character().slug));
  }

  private reveal(unlock: () => void): void {
    this.password.reset('');
    this.hasError.set(false);
    this.isShaking.set(false);
    unlock();

    // Depois da troca de conteúdo, o foco passa para a ficha revelada.
    this.focusTimer = setTimeout(() => this.sheetRegion()?.nativeElement.focus());
  }

  private reject(): void {
    this.hasError.set(true);
    this.isShaking.set(false);

    if (this.shakeTimer) {
      clearTimeout(this.shakeTimer);
    }

    // Reinicia o tremor mesmo em tentativas consecutivas.
    this.shakeTimer = setTimeout(() => this.isShaking.set(true), 20);
  }
}
