import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterDirectory } from '../../core/character/character-directory';
import { Character, CharacterEmblemVariant } from '../../core/character/character.model';
import { Atmosphere } from '../../shared/atmosphere/atmosphere';
import { CharacterEmblem } from '../character/character-emblem';
import { CharacterMotif } from '../character/character-motif';

interface GalleryCard {
  readonly character: Character;
  readonly index: string;
  readonly initial: string;
  readonly emblem: CharacterEmblemVariant;
}

/**
 * Galeria dos destinos: reaproveita o emblema e o motivo de cada ficha,
 * levando o visitante direto para a página individual do personagem.
 */
@Component({
  selector: 'app-gallery',
  imports: [Atmosphere, RouterLink, CharacterEmblem, CharacterMotif],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  private readonly directory = inject(CharacterDirectory);

  protected readonly cards: readonly GalleryCard[] = this.directory.characters.map(
    (character, index) => ({
      character,
      index: String(index + 1).padStart(2, '0'),
      initial: character.name.charAt(0),
      emblem: character.dossier?.emblem ?? 'bulwark',
    }),
  );
}
