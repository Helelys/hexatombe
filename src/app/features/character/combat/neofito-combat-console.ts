import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Character, CharacterSheetAction } from '../../../core/character/character.model';
import {
  CartographySettings,
  HemofagiaChoice,
  NeofitoCombat,
  NeofitoSpecialId,
  RitualEffectSettings,
  NEOFITO_SPECIAL_NAMES,
} from '../../../core/character/combat/neofito-combat';
import { SheetForm } from '../character-sheet';

/**
 * Mesa de combate do Neófito.
 *
 * A ficha final ainda não fixou os números de alguns rituais, então o painel
 * pede a configuração da mesa (`NeofitoSettings`) antes de liberar cada
 * conjuração. Nenhum valor é inventado aqui: campo vazio = ritual bloqueado.
 */
@Component({
  selector: 'app-neofito-combat-console',
  templateUrl: './neofito-combat-console.html',
  styleUrls: ['./combat-panel.css', './neofito-combat-console.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeofitoCombatConsole {
  readonly character = input.required<Character>();
  readonly form = input<SheetForm>('common');

  protected readonly engine = computed(() => new NeofitoCombat(this.character(), this.form()));
  protected readonly draftName = signal('');
  protected readonly incomingDamage = signal('');
  protected readonly choice = signal<HemofagiaChoice>('absorb');
  protected readonly specialNames = NEOFITO_SPECIAL_NAMES;
  protected readonly specialIds: readonly NeofitoSpecialId[] = ['offering', 'rite'];

  /** Rituais configuráveis (a Hemofagia já tem dados fixos na ficha). */
  protected readonly configuredRituals = computed(() =>
    this.engine().rituals.filter((ritual) => ritual.mechanics?.kind === 'ritual'),
  );

  protected readonly markedCount = computed(() => this.engine().markedEnemies().length);

  protected needsDamage(ritual: CharacterSheetAction): boolean {
    const kind = ritual.mechanics?.ritualKind;
    return kind === 'damage' || kind === 'hybrid';
  }

  protected needsHeal(ritual: CharacterSheetAction): boolean {
    const kind = ritual.mechanics?.ritualKind;
    return kind === 'heal' || kind === 'hybrid';
  }

  protected needsRounds(ritual: CharacterSheetAction): boolean {
    const kind = ritual.mechanics?.ritualKind;
    return kind === 'control' || kind === 'hybrid';
  }

  protected onInput(target: 'name' | 'damage', event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (target === 'name') {
      this.draftName.set(value);
      return;
    }

    this.incomingDamage.set(value);
  }

  protected addEnemy(event: Event): void {
    event.preventDefault();
    const created = this.engine().addEnemy(this.draftName());

    if (created) {
      this.draftName.set('');
    }
  }

  protected applyIncomingDamage(): void {
    const amount = Number(this.incomingDamage());

    if (!Number.isFinite(amount)) {
      return;
    }

    this.engine().applyDamage(amount);
    this.incomingDamage.set('');
  }

  protected setMarkCost(event: Event): void {
    const value = this.readNumber(event);
    this.engine().updateSettings((settings) => ({ ...settings, markCost: value }));
  }

  protected setRitualEffect(name: string, field: keyof RitualEffectSettings, event: Event): void {
    const raw = this.readText(event);
    const value = field === 'rounds' ? this.readNumber(event) : raw || null;

    this.engine().updateSettings((settings) => ({
      ...settings,
      ritualEffects: {
        ...settings.ritualEffects,
        [name]: { ...settings.ritualEffects[name], [field]: value },
      },
    }));
  }

  protected setCartography(field: keyof CartographySettings, event: Event): void {
    const raw = this.readText(event);
    const value = field === 'damage' || field === 'heal' ? raw || null : this.readNumber(event);

    this.engine().updateSettings((settings) => ({
      ...settings,
      cartography: { ...settings.cartography, [field]: value },
    }));
  }

  protected setSpecial(id: NeofitoSpecialId, field: 'cost' | 'bonus', event: Event): void {
    const raw = this.readText(event);
    const value = field === 'cost' ? this.readNumber(event) : raw || null;

    this.engine().updateSettings((settings) => ({
      ...settings,
      specials: { ...settings.specials, [id]: { ...settings.specials[id], [field]: value } },
    }));
  }

  protected castRitual(ritual: CharacterSheetAction): void {
    const options = ritual.mechanics?.kind === 'hemofagia' ? { choice: this.choice() } : {};
    this.engine().castRitual(ritual.name, options);
  }

  protected castCartography(): void {
    this.engine().castCartography();
  }

  protected useSpecial(id: NeofitoSpecialId): void {
    this.engine().useSpecial(id);
  }

  protected markLabel(id: NeofitoSpecialId): string {
    return this.engine().specials[id]?.name ?? this.specialNames[id];
  }

  private readText(event: Event): string {
    return (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  private readNumber(event: Event): number | null {
    const raw = (event.target as HTMLInputElement).value.trim();

    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
