import { CharacterPortrait } from './character.model';

/**
 * Avatar neutro usado quando a arte oficial não carrega.
 * A imagem fica em `public/portraits/` e é servida na raiz da aplicação.
 */
export const PORTRAIT_PLACEHOLDER_SRC = '/portraits/placeholder.jpg';

/**
 * Arte oficial do destino: ilustração de corpo inteiro em PNG, recortada em
 * fundo transparente. A imagem é exibida inteira (`object-fit: contain`), então
 * nenhuma proporção é alterada. Se a arte falhar, o placeholder assume.
 */
const officialPortrait = (src: string, alt: string): CharacterPortrait => ({
  src,
  alt,
  fallbackSrc: PORTRAIT_PLACEHOLDER_SRC,
});

/**
 * Uma arte independente por personagem. Para trocar a ilustração de um destino,
 * basta apontar o `src` da entrada correspondente para a nova imagem.
 */
export const CHARACTER_PORTRAITS = {
  'anne-kent': officialPortrait('https://i.imgur.com/4AugKVL.png', 'Retrato de Anne Kent'),
  'david-moura': officialPortrait('https://i.imgur.com/W2wu8U7.png', 'Retrato de David Moura'),
  'lia-kwon': officialPortrait('https://i.imgur.com/Wih09mz.png', 'Retrato de Lia Kwon'),
  'cecilia-nunes': officialPortrait('https://i.imgur.com/w1ID7JY.png', 'Retrato de Cecília Nunes'),
  neofito: officialPortrait('https://i.imgur.com/nviA3Je.png', 'Retrato de Neófito'),
  'artur-pires': officialPortrait('https://i.imgur.com/vuFqW67.png', 'Retrato de Artur Pires'),
} as const satisfies Record<string, CharacterPortrait>;
