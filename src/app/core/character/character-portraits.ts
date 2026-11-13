import { CharacterPortrait } from './character.model';

/**
 * Avatar neutro usado enquanto cada destino não recebe seu retrato definitivo.
 * A imagem fica em `public/portraits/` e é servida na raiz da aplicação.
 */
export const PORTRAIT_PLACEHOLDER_SRC = '/portraits/placeholder.jpg';

const placeholderPortrait = (alt: string): CharacterPortrait => ({
  src: PORTRAIT_PLACEHOLDER_SRC,
  alt,
  fallbackSrc: PORTRAIT_PLACEHOLDER_SRC,
});

/**
 * Um retrato independente por personagem. Para trocar a arte de um destino,
 * basta apontar o `src` da entrada correspondente para a nova imagem; se ela
 * falhar, a ficha volta automaticamente ao placeholder.
 */
export const CHARACTER_PORTRAITS = {
  'anne-kent': placeholderPortrait('Retrato de Anne Kent'),
  'david-moura': placeholderPortrait('Retrato de David Moura'),
  'lia-kwon': placeholderPortrait('Retrato de Lia Kwon'),
  'cecilia-nunes': placeholderPortrait('Retrato de Cecília Nunes'),
  neofito: placeholderPortrait('Retrato de Neófito'),
  'artur-pires': placeholderPortrait('Retrato de Artur Pires'),
} as const satisfies Record<string, CharacterPortrait>;
