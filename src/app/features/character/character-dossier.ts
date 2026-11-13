import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CharacterDossier, CharacterMood } from '../../core/character/character.model';
import { CharacterAbilities } from './character-abilities';
import { CharacterAttributes } from './character-attributes';
import { CharacterPortraitView } from './character-portrait';

/**
 * A ficha em si: nome, frase, atributos e habilidades.
 * O retrato ocupa a região direita quando a ficha possui arte.
 */
@Component({
  selector: 'app-character-dossier',
  imports: [CharacterAbilities, CharacterAttributes, CharacterPortraitView],
  templateUrl: './character-dossier.html',
  styleUrl: './character-dossier.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mood]': 'mood()',
    '[attr.data-emblem]': 'dossier().emblem',
  },
})
export class CharacterDossierView {
  readonly name = input.required<string>();
  readonly mood = input.required<CharacterMood>();
  readonly dossier = input.required<CharacterDossier>();

  protected readonly initial = computed(() => this.name().charAt(0));
  protected readonly portrait = computed(() => this.dossier().portrait ?? null);
}
