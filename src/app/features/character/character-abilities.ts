import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CharacterAbility } from '../../core/character/character.model';

/** Lista vertical de habilidades, um bloco por habilidade. */
@Component({
  selector: 'app-character-abilities',
  templateUrl: './character-abilities.html',
  styleUrl: './character-abilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterAbilities {
  readonly abilities = input.required<readonly CharacterAbility[]>();

  protected readonly numbered = computed(() =>
    this.abilities().map((ability, index) => ({
      ...ability,
      order: String(index + 1).padStart(2, '0'),
    })),
  );
}
