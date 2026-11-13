import { Injectable, signal } from '@angular/core';
import { normalizePassword } from './character-directory';

/** Registro das formas mascaradas já liberadas durante a sessão do navegador. */
export const MASK_ACCESS_KEY = 'hexatombe:mascaras-liberadas';

/**
 * Senha única da transformação, válida para os seis destinos.
 *
 * É independente das senhas individuais das fichas comuns: saber `mascara` não
 * abre nenhuma ficha VD 80 e saber a senha de um destino não desperta máscara.
 */
export const MASKED_FORM_PASSWORD = 'mascara';

/** Reconhece a senha da máscara mesmo com caixa, acentos e espaços extras. */
export function isMaskedFormPassword(value: string): boolean {
  return normalizePassword(value) === MASKED_FORM_PASSWORD;
}

function readUnlockedSlugs(): readonly string[] {
  try {
    const raw = sessionStorage.getItem(MASK_ACCESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
  } catch {
    // Armazenamento indisponível (modo privado, SSR): a máscara vale só nesta visita.
    return [];
  }
}

/**
 * Lembra quais formas mascaradas já foram despertadas nesta sessão.
 *
 * A liberação fica separada da ficha comum (`SHEET_ACCESS_KEY`), então a
 * máscara sobrevive a um recarregamento e pode ser retirada e recolocada sem
 * pedir a senha de novo, mas se encerra quando a aba é fechada.
 */
@Injectable({ providedIn: 'root' })
export class MaskAccess {
  private readonly unlocked = signal<readonly string[]>(readUnlockedSlugs());

  isUnlocked(slug: string): boolean {
    return this.unlocked().includes(slug);
  }

  unlock(slug: string): void {
    if (!slug || this.isUnlocked(slug)) {
      return;
    }

    const slugs = [...this.unlocked(), slug];
    this.unlocked.set(slugs);

    try {
      sessionStorage.setItem(MASK_ACCESS_KEY, JSON.stringify(slugs));
    } catch {
      // Sem armazenamento a liberação vale apenas para a visita atual.
    }
  }
}
