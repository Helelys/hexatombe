import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ATTRIBUTE_LABELS,
  CharacterAttribute,
  CharacterEmblemVariant,
} from '../../core/character/character.model';
import { CharacterEmblem } from './character-emblem';

/**
 * Os cinco atributos distribuídos ao redor do emblema central.
 * As posições são fixas por chave; os valores vêm da ficha do personagem.
 */
@Component({
  selector: 'app-character-attributes',
  imports: [CharacterEmblem],
  templateUrl: './character-attributes.html',
  styleUrl: './character-attributes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterAttributes {
  readonly attributes = input.required<readonly CharacterAttribute[]>();
  readonly emblem = input<CharacterEmblemVariant>('bulwark');

  protected readonly rows = computed(() =>
    this.attributes().map((attribute) => ({
      ...attribute,
      label: ATTRIBUTE_LABELS[attribute.key],
    })),
  );
}
