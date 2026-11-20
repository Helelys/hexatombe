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
  /** Classificação extra, como "Ritual de 2º círculo". */
  readonly category?: string;
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
  /** Imagem exibida quando `src` não carrega; usa o avatar provisório por padrão. */
  readonly fallbackSrc?: string;
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

/** Perícia da ficha completa: dados rolados e modificador fixo do teste. */
export interface CharacterSkill {
  readonly name: string;
  /** Dados rolados no teste, por exemplo `4d20`. */
  readonly dice: string;
  /** Modificador fixo do teste, por exemplo `+10`. */
  readonly modifier: string;
}

/** Item carregado pelo personagem, exibido na seção Itens da ficha. */
export interface CharacterItem {
  readonly name: string;
  /** Categoria curta do item, como "Arma corpo a corpo". */
  readonly type: string;
}

/** Ataque, ação ou restrição descrita na ficha completa. */
export interface CharacterSheetAction {
  readonly name: string;
  /** Classificação extra, como "Ritual de 2º círculo". */
  readonly category?: string;
  /** Tipo de ação: Padrão, Livre, Reação... */
  readonly action?: string;
  /** Alcance do efeito. */
  readonly range?: string;
  /** Teste utilizado no ataque ou na resistência do alvo. */
  readonly test?: string;
  readonly damage?: string;
  readonly damageType?: string;
  /** Margem de crítico e multiplicador, por exemplo `19/x3`. */
  readonly critical?: string;
  readonly cost?: string;
  readonly limit?: string;
  /** Condições e efeitos especiais. */
  readonly description?: string;
}

/** Ficha completa, revelada somente com a senha do personagem. */
export interface CharacterSheet {
  /** A idade permanece desconhecida em todas as fichas. */
  readonly age: string;
  /** Arquétipo do personagem, exibido na identificação. */
  readonly archetype: string;
  readonly defense: string;
  readonly fortitude: string;
  readonly reflexes: string;
  readonly will: string;
  readonly hitPoints: string;
  readonly wounded: string;
  readonly effortPoints: string;
  readonly speed: string;
  readonly perception: string;
  readonly initiative: string;
  readonly skills: readonly CharacterSkill[];
  readonly actions: readonly CharacterSheetAction[];
  /** Equipamento carregado, separado dos ataques na seção Itens. */
  readonly items: readonly CharacterItem[];
  readonly intention: string;
}

/**
 * Forma mascarada de um destino (VD 140).
 *
 * Os números são os máximos da transformação: a máscara não devolve PV nem PE,
 * o esforço é compartilhado entre as duas formas e os PV atuais continuam os
 * mesmos. Por isso a ficha mascarada é apenas uma leitura nova dos mesmos
 * recursos, nunca uma segunda barra de vida.
 */
export interface MaskedForm {
  /** Nome que a máscara assume, como "O Lastro". */
  readonly name: string;
  /** VD desta forma, exibido na identificação. */
  readonly grade: string;
  /** Os cinco atributos da forma mascarada. */
  readonly attributes: readonly CharacterAttribute[];
  /** Ficha completa com os valores máximos da transformação. */
  readonly sheet: CharacterSheet;
  /** Habilidades liberadas apenas nesta forma. */
  readonly abilities: readonly CharacterAbility[];
  /** Poder de intenção, exclusivo desta forma. */
  readonly intention: CharacterAbility;
}

export interface Character {
  readonly slug: string;
  readonly name: string;
  readonly password: string;
  readonly theme: CharacterTheme;
  readonly dossier?: CharacterDossier;
  /** Ficha completa selada; ausente enquanto o personagem não possui ficha. */
  readonly sheet?: CharacterSheet;
  /** Forma mascarada VD 140, selada pela senha única da transformação. */
  readonly maskedForm?: MaskedForm;
}
