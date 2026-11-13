import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router, Routes } from '@angular/router';
import { CharacterDirectory } from './core/character/character-directory';
import { Character } from './core/character/character.model';
import { CharacterPage } from './features/character/character-page';
import { CharacterSheetPage } from './features/character/character-sheet-page';
import { Gallery } from './features/gallery/gallery';
import { Landing } from './features/landing/landing';

const resolveCharacter: ResolveFn<Character> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');

  if (character) {
    return character;
  }

  return new RedirectCommand(inject(Router).parseUrl('/galeria'));
};

const resolveCharacterTitle: ResolveFn<string> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  return character ? `${character.name} — Hexatombe` : 'Hexatombe';
};

/**
 * A ficha completa só existe em rota própria. Sem documento selado, o destino
 * volta para a página individual; um slug desconhecido volta para a galeria.
 */
const resolveSheetCharacter: ResolveFn<Character> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  const router = inject(Router);

  if (character?.sheet) {
    return character;
  }

  return new RedirectCommand(
    router.parseUrl(character ? `/destino/${character.slug}` : '/galeria'),
  );
};

const resolveSheetTitle: ResolveFn<string> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  return character ? `${character.name} — ficha completa — Hexatombe` : 'Hexatombe';
};

/**
 * A forma mascarada também vive em rota própria. Sem a ficha VD 140 selada, o
 * destino volta para a própria página do personagem.
 */
const resolveMaskCharacter: ResolveFn<Character> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  const router = inject(Router);

  if (character?.maskedForm) {
    return character;
  }

  return new RedirectCommand(
    router.parseUrl(character ? `/destino/${character.slug}` : '/galeria'),
  );
};

const resolveMaskTitle: ResolveFn<string> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  return character ? `${character.name} — forma mascarada — Hexatombe` : 'Hexatombe';
};

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    title: 'Hexatombe',
  },
  {
    path: 'galeria',
    component: Gallery,
    title: 'Galeria de personagens — Hexatombe',
  },
  {
    path: 'destino/:slug/mascara',
    component: CharacterSheetPage,
    resolve: { character: resolveMaskCharacter },
    data: { form: 'masked' },
    title: resolveMaskTitle,
  },
  {
    path: 'destino/:slug/ficha',
    component: CharacterSheetPage,
    resolve: { character: resolveSheetCharacter },
    title: resolveSheetTitle,
  },
  {
    path: 'destino/:slug',
    component: CharacterPage,
    resolve: { character: resolveCharacter },
    title: resolveCharacterTitle,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
