import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CharacterDirectory } from '../../core/character/character-directory';
import { Character } from '../../core/character/character.model';

const LEAVE_DELAY = 260;

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'dismiss()',
  },
})
export class AuthModal {
  private readonly directory = inject(CharacterDirectory);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previousOverflow = document.body.style.overflow;
  private readonly previousFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  readonly dismissed = output<void>();
  readonly authenticated = output<Character>();

  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly hasError = signal(false);
  protected readonly isShaking = signal(false);
  protected readonly isLeaving = signal(false);
  protected readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  protected readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  private closed = false;
  private shouldRestoreFocus = true;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private shakeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    document.body.style.overflow = 'hidden';
    afterNextRender(() => this.passwordInput()?.nativeElement.focus());

    this.destroyRef.onDestroy(() => {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
      }

      if (this.shakeTimer) {
        clearTimeout(this.shakeTimer);
      }

      document.body.style.overflow = this.previousOverflow;

      if (this.shouldRestoreFocus) {
        this.previousFocus?.focus();
      }
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();

    if (this.isLeaving()) {
      return;
    }

    const character = this.directory.findByPassword(this.password.value);

    if (!character) {
      this.reject();
      return;
    }

    this.shouldRestoreFocus = false;
    this.password.disable({ emitEvent: false });
    this.isLeaving.set(true);
    this.authenticated.emit(character);
  }

  protected dismiss(): void {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.isLeaving.set(true);
    this.leaveTimer = setTimeout(() => this.dismissed.emit(), LEAVE_DELAY);
  }

  protected clearError(): void {
    if (this.hasError()) {
      this.hasError.set(false);
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss();
    }
  }

  protected onDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.dialog()?.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable || focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (active === first || active === this.dialog()?.nativeElement)) {
      event.preventDefault();
      last.focus();
    }
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
