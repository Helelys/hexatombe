import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Character } from '../../../core/character/character.model';
import { LiaCombat } from '../../../core/character/combat/lia-combat';
import { SheetForm } from '../character-sheet';

/**
 * Mesa de combate da Lia Kwon.
 *
 * A lógica fica em `LiaCombat`; o componente apenas conduz alvos, níveis de
 * Hemorragia e os botões de ataque, exibindo o log rolagem a rolagem.
 */
@Component({
  selector: 'app-lia-combat-console',
  templateUrl: './lia-combat-console.html',
  styleUrls: ['./combat-panel.css', './lia-combat-console.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiaCombatConsole {
  readonly character = input.required<Character>();
  readonly form = input<SheetForm>('common');

  protected readonly engine = computed(() => new LiaCombat(this.character(), this.form()));
  protected readonly draftName = signal('');

  protected readonly levels = [1, 2, 3] as const;

  protected onNameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  protected addEnemy(event: Event): void {
    event.preventDefault();
    const created = this.engine().addEnemy(this.draftName());

    if (created) {
      this.draftName.set('');
    }
  }

  /** Marca o nível clicado; clicar no nível atual reduz um. */
  protected setBleed(id: string, level: number): void {
    const engine = this.engine();
    const enemy = engine.enemies().find((entry) => entry.id === id);

    if (!enemy) {
      return;
    }

    let current = enemy.hemorrhage;

    if (current === level) {
      engine.removeHemorrhage(id);
      return;
    }

    while (current < level) {
      const applied = engine.addHemorrhage(id, 1);
      if (applied <= 0) {
        break;
      }
      current += applied;
    }

    while (current > level) {
      engine.removeHemorrhage(id);
      current -= 1;
    }
  }
}
