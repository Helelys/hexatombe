import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface AshMote {
  readonly id: number;
  readonly left: number;
  readonly size: number;
  readonly duration: number;
  readonly delay: number;
  readonly drift: number;
  readonly peak: number;
}

function mulberry32(seed: number): () => number {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createMotes(): readonly AshMote[] {
  const random = mulberry32(0x8b0000);

  return Array.from({ length: 30 }, (_, id) => ({
    id,
    left: Number((random() * 100).toFixed(2)),
    size: Number((0.8 + random() * 1.8).toFixed(2)),
    duration: Number((22 + random() * 26).toFixed(2)),
    delay: Number((-random() * 46).toFixed(2)),
    drift: Number(((random() - 0.5) * 90).toFixed(2)),
    peak: Number((0.16 + random() * 0.34).toFixed(2)),
  }));
}

@Component({
  selector: 'app-atmosphere',
  templateUrl: './atmosphere.html',
  styleUrl: './atmosphere.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.atmosphere--character]': "variant() === 'character'",
    '[style.--atmosphere-tone]': 'tone()',
  },
})
export class Atmosphere {
  readonly tone = input('#8b0000');
  readonly variant = input<'portal' | 'character'>('portal');

  protected readonly motes = createMotes();
}
