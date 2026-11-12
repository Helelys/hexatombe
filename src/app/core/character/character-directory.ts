import { Injectable } from '@angular/core';
import { Character } from './character.model';
import { CHARACTERS } from './characters.data';

/** Remove caixa, acentos e espaços excedentes para reconhecer a senha digitada. */
export function normalizePassword(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

@Injectable({ providedIn: 'root' })
export class CharacterDirectory {
  readonly characters = CHARACTERS;

  findByPassword(value: string): Character | null {
    const password = normalizePassword(value);

    if (!password) {
      return null;
    }

    return this.characters.find((character) => character.password === password) ?? null;
  }

  findBySlug(slug: string): Character | null {
    const normalizedSlug = slug.trim().toLowerCase();
    return this.characters.find((character) => character.slug === normalizedSlug) ?? null;
  }
}
