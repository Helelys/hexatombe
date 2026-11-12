export type CharacterMood = 'tremor' | 'frenzy' | 'edge' | 'void' | 'relic' | 'cold';

export interface CharacterTheme {
  /** Cor de luz que acompanha o personagem. */
  readonly accent: string;
  /** Brilho aplicado ao nome. */
  readonly glow: string;
  /** Movimento próprio do nome na página do personagem. */
  readonly mood: CharacterMood;
}

/** Os cinco atributos fixos da ficha. */
export type AttributeKey = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

/** Nome por extenso de cada atributo, exibido abaixo do valor. */
export const ATTRIBUTE_LABELS: Readonly<Record<AttributeKey, string>> = {
  AGI: 'Agilidade',
  FOR: 'Força',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

export interface CharacterAttribute {
  readonly key: AttributeKey;
  readonly value: number;
}

export interface CharacterAbility {
  readonly name: string;
  /** Tipo de ação: Reação, Padrão, Livre... */
  readonly action: string;
  /** Custo em pontos de esforço, quando houver. */
  readonly cost?: string;
  /** Limite de uso, quando houver. */
  readonly limit?: string;
  readonly description: string;
}

/**
 * Símbolo central da ficha. Cada variante tem desenho e movimento próprios:
 * bulwark (resistência), ram (impacto), edge (lâminas), sight (mira),
 * ritual (ocultismo) e scrap (improviso).
 */
export type CharacterEmblemVariant = 'bulwark' | 'ram' | 'edge' | 'sight' | 'ritual' | 'scrap';

export interface CharacterPortrait {
  readonly src: string;
  readonly alt: string;
}

/** Ficha individual. Opcional: personagens sem ficha mantêm a página essencial. */
export interface CharacterDossier {
  readonly quote: string;
  readonly attributes: readonly CharacterAttribute[];
  readonly abilities: readonly CharacterAbility[];
  readonly emblem: CharacterEmblemVariant;
  /** Ilustração individual; ausente enquanto o personagem não possui arte. */
  readonly portrait?: CharacterPortrait;
}

export interface Character {
  readonly slug: string;
  readonly name: string;
  readonly password: string;
  readonly theme: CharacterTheme;
  readonly dossier?: CharacterDossier;
}
