import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CharacterEmblemVariant } from '../../core/character/character.model';

/**
 * Símbolo central de uma ficha. Cada personagem escolhe uma variante,
 * de modo que novos emblemas sejam adicionados sem alterar as páginas.
 */
@Component({
  selector: 'app-character-emblem',
  templateUrl: './character-emblem.html',
  styleUrl: './character-emblem.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-variant]': 'variant()',
  },
})
export class CharacterEmblem {
  readonly variant = input<CharacterEmblemVariant>('bulwark');
}
