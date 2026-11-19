/** Registro compartilhado pelas mesas de combate das fichas automatizadas. */

export type CombatLogTone = 'damage' | 'blood' | 'ritual' | 'system';

export interface CombatLogEntry {
  readonly id: number;
  readonly round: number;
  readonly title: string;
  readonly lines: readonly string[];
  readonly tone: CombatLogTone;
}
