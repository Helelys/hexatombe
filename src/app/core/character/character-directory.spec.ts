import { CharacterDirectory, normalizePassword } from './character-directory';

describe('CharacterDirectory', () => {
  const directory = new CharacterDirectory();

  const destinations: ReadonlyArray<readonly [password: string, name: string]> = [
    ['descontrole', 'Anne Kent'],
    ['loucura', 'David Moura'],
    ['lamina', 'Lia Kwon'],
    ['vazio', 'Cecília Nunes'],
    ['passado', 'Neófito'],
    ['abandonado', 'Artur Pires'],
  ];

  it('reconhece cada senha e seu personagem', () => {
    for (const [password, name] of destinations) {
      expect(directory.findByPassword(password)?.name).toBe(name);
    }
  });

  it('ignora caixa e espaços nas pontas', () => {
    expect(directory.findByPassword('  DeScOnTrOlE  ')?.slug).toBe('anne-kent');
    expect(directory.findByPassword('\tABANDONADO\n')?.slug).toBe('artur-pires');
  });

  it('ignora acentos na senha digitada', () => {
    expect(directory.findByPassword('LÂMINA')?.slug).toBe('lia-kwon');
    expect(directory.findByPassword('  Neófito  ')).toBeNull();
  });

  it('recusa senhas vazias ou desconhecidas', () => {
    expect(directory.findByPassword('')).toBeNull();
    expect(directory.findByPassword('   ')).toBeNull();
    expect(directory.findByPassword('destino')).toBeNull();
  });

  it('normaliza a senha de forma determinística', () => {
    expect(normalizePassword('  Passado  ')).toBe('passado');
    expect(normalizePassword('LÂMINA')).toBe('lamina');
    expect(normalizePassword('  dois   espacos  ')).toBe('dois espacos');
    expect(normalizePassword('  Dois   Espaços  ')).toBe('dois espacos');
  });

  it('encontra personagens pelo slug', () => {
    expect(directory.findBySlug('cecilia-nunes')?.name).toBe('Cecília Nunes');
    expect(directory.findBySlug('  NEOFITO ')?.name).toBe('Neófito');
    expect(directory.findBySlug('anne')).toBeNull();
  });

  it('mantém senhas e slugs únicos', () => {
    const passwords = new Set(directory.characters.map((character) => character.password));
    const slugs = new Set(directory.characters.map((character) => character.slug));

    expect(passwords.size).toBe(destinations.length);
    expect(slugs.size).toBe(destinations.length);
  });
});
