import { SHEET_ACCESS_KEY, SheetAccess } from './sheet-access';

describe('SheetAccess', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  function stored(): string[] {
    return JSON.parse(sessionStorage.getItem(SHEET_ACCESS_KEY) ?? '[]') as string[];
  }

  it('começa com todas as fichas seladas', () => {
    expect(new SheetAccess().isUnlocked('anne-kent')).toBe(false);
  });

  it('libera apenas a ficha aberta', () => {
    const access = new SheetAccess();
    access.unlock('anne-kent');

    expect(access.isUnlocked('anne-kent')).toBe(true);
    expect(access.isUnlocked('david-moura')).toBe(false);
  });

  it('mantém a liberação gravada na sessão', () => {
    new SheetAccess().unlock('anne-kent');

    expect(stored()).toEqual(['anne-kent']);
    // Uma instância nova representa o recarregamento da página.
    expect(new SheetAccess().isUnlocked('anne-kent')).toBe(true);
  });

  it('não duplica a mesma ficha', () => {
    const access = new SheetAccess();
    access.unlock('anne-kent');
    access.unlock('anne-kent');

    expect(stored()).toEqual(['anne-kent']);
  });

  it('ignora registros inválidos ao ler a sessão', () => {
    sessionStorage.setItem(SHEET_ACCESS_KEY, 'não é json');
    expect(new SheetAccess().isUnlocked('anne-kent')).toBe(false);

    sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify({ slug: 'anne-kent' }));
    expect(new SheetAccess().isUnlocked('anne-kent')).toBe(false);
  });

  it('descarta slugs vazios ou inválidos guardados na sessão', () => {
    sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify(['', 42, 'anne-kent']));

    const access = new SheetAccess();
    access.unlock('david-moura');

    expect(stored()).toEqual(['anne-kent', 'david-moura']);
  });

  it('ignora pedidos de liberação sem slug', () => {
    new SheetAccess().unlock('');

    expect(stored()).toEqual([]);
  });
});
