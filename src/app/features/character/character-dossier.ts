import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CharacterDossier, CharacterMood } from '../../core/character/character.model';
import { CharacterAbilities } from './character-abilities';
import { CharacterAttributes } from './character-attributes';

/**
 * A ficha em si: nome, frase, atributos e habilidades.
 * A ilustração é opcional e ocupa o topo da coluna direita quando existir.
 */
@Component({
  selector: 'app-character-dossier',
  imports: [CharacterAbilities, CharacterAttributes],
  templateUrl: './character-dossier.html',
  styleUrl: './character-dossier.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mood]': 'mood()',
  },
})
export class CharacterDossierView {
  readonly name = input.required<string>();
  readonly mood = input.required<CharacterMood>();
  readonly dossier = input.required<CharacterDossier>();

  protected readonly initial = computed(() => this.name().charAt(0));
  protected readonly portrait = computed(() => this.dossier().portrait ?? null);
}
