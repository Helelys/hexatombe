import { Injectable, signal } from '@angular/core';

/** Registro das fichas já liberadas durante a sessão do navegador. */
export const SHEET_ACCESS_KEY = 'hexatombe:fichas-liberadas';

function readUnlockedSlugs(): readonly string[] {
  try {
    const raw = sessionStorage.getItem(SHEET_ACCESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
  } catch {
    // Armazenamento indisponível (modo privado, SSR): a ficha abre só nesta visita.
    return [];
  }
}

/**
 * Lembra quais fichas completas já foram abertas com a senha correta.
 *
 * A liberação fica no `sessionStorage`, então sobrevive a um recarregamento da
 * página — a ficha continua visível — mas se encerra quando a aba é fechada,
 * mantendo cada ficha selada para quem chega depois.
 */
@Injectable({ providedIn: 'root' })
export class SheetAccess {
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
      sessionStorage.setItem(SHEET_ACCESS_KEY, JSON.stringify(slugs));
    } catch {
      // Sem armazenamento a liberação vale apenas para a visita atual.
    }
  }
}
