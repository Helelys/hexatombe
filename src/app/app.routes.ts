import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router, Routes } from '@angular/router';
import { CharacterDirectory } from './core/character/character-directory';
import { Character } from './core/character/character.model';
import { CharacterPage } from './features/character/character-page';
import { Landing } from './features/landing/landing';

const resolveCharacter: ResolveFn<Character> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');

  if (character) {
    return character;
  }

  return new RedirectCommand(inject(Router).parseUrl('/'));
};

const resolveCharacterTitle: ResolveFn<string> = (route) => {
  const character = inject(CharacterDirectory).findBySlug(route.paramMap.get('slug') ?? '');
  return character ? `${character.name} — Hexatombe` : 'Hexatombe';
};

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    title: 'Hexatombe',
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
