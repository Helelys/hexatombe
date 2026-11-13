import {
  MASKED_FORM_PASSWORD,
  MASK_ACCESS_KEY,
  MaskAccess,
  isMaskedFormPassword,
} from './mask-access';
import { SHEET_ACCESS_KEY } from './sheet-access';

describe('senha da máscara', () => {
  it('usa uma senha única, válida para os seis destinos', () => {
    expect(MASKED_FORM_PASSWORD).toBe('mascara');
  });

  it('aceita a senha com caixa, acentos e espaços extras', () => {
    expect(isMaskedFormPassword('mascara')).toBe(true);
    expect(isMaskedFormPassword('  MÁSCARA  ')).toBe(true);
    expect(isMaskedFormPassword('Mascara')).toBe(true);
  });

  it('recusa as senhas individuais e qualquer outra tentativa', () => {
    expect(isMaskedFormPassword('descontrole')).toBe(false);
    expect(isMaskedFormPassword('loucura')).toBe(false);
    expect(isMaskedFormPassword('mascaras')).toBe(false);
    expect(isMaskedFormPassword('')).toBe(false);
  });
});

describe('MaskAccess', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  function stored(): string[] {
    return JSON.parse(sessionStorage.getItem(MASK_ACCESS_KEY) ?? '[]') as string[];
  }

  it('começa com todas as máscaras seladas', () => {
    expect(new MaskAccess().isUnlocked('anne-kent')).toBe(false);
  });

  it('desperta apenas a máscara liberada', () => {
    const masks = new MaskAccess();
    masks.unlock('anne-kent');

    expect(masks.isUnlocked('anne-kent')).toBe(true);
    expect(masks.isUnlocked('david-moura')).toBe(false);
  });

  it('mantém a máscara separada das fichas comuns', () => {
    new MaskAccess().unlock('anne-kent');

    expect(stored()).toEqual(['anne-kent']);
    expect(sessionStorage.getItem(SHEET_ACCESS_KEY)).toBeNull();
  });

  it('mantém a liberação gravada na sessão', () => {
    new MaskAccess().unlock('neofito');

    expect(stored()).toEqual(['neofito']);
    // Uma instância nova representa o recarregamento da página.
    expect(new MaskAccess().isUnlocked('neofito')).toBe(true);
  });

  it('não duplica a mesma máscara', () => {
    const masks = new MaskAccess();
    masks.unlock('anne-kent');
    masks.unlock('anne-kent');

    expect(stored()).toEqual(['anne-kent']);
  });

  it('ignora registros inválidos ao ler a sessão', () => {
    sessionStorage.setItem(MASK_ACCESS_KEY, 'não é json');
    expect(new MaskAccess().isUnlocked('anne-kent')).toBe(false);

    sessionStorage.setItem(MASK_ACCESS_KEY, JSON.stringify({ slug: 'anne-kent' }));
    expect(new MaskAccess().isUnlocked('anne-kent')).toBe(false);

    sessionStorage.setItem(MASK_ACCESS_KEY, JSON.stringify(['', 42, 'anne-kent']));

    const masks = new MaskAccess();
    masks.unlock('artur-pires');

    expect(stored()).toEqual(['anne-kent', 'artur-pires']);
  });

  it('ignora pedidos de liberação sem slug', () => {
    new MaskAccess().unlock('');

    expect(stored()).toEqual([]);
  });
});
