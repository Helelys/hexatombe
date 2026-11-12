import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CharacterEmblemVariant } from '../../core/character/character.model';

/**
 * Marcas que cercam o emblema e traduzem o estilo de combate do personagem.
 * A variante `bulwark` não acrescenta nada: a ficha de Anne Kent permanece intacta.
 */
@Component({
  selector: 'app-character-motif',
  templateUrl: './character-motif.html',
  styleUrl: './character-motif.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-variant]': 'variant()',
  },
})
export class CharacterMotif {
  readonly variant = input<CharacterEmblemVariant>('bulwark');
}
