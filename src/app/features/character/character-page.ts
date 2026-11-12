import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Character } from '../../core/character/character.model';
import { Atmosphere } from '../../shared/atmosphere/atmosphere';
import { CharacterDossierView } from './character-dossier';

@Component({
  selector: 'app-character-page',
  imports: [Atmosphere, RouterLink, CharacterDossierView],
  templateUrl: './character-page.html',
  styleUrl: './character-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--character-accent]': 'character().theme.accent',
    '[style.--character-glow]': 'character().theme.glow',
  },
})
export class CharacterPage {
  readonly character = input.required<Character>();

  protected readonly initial = computed(() => this.character().name.charAt(0));
  protected readonly dossier = computed(() => this.character().dossier ?? null);
}

