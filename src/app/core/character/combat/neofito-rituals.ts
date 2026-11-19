import { CharacterSheetAction } from '../character.model';

/**
 * Rituais de sangue do Neófito.
 *
 * A ficha final aprovada ainda não fixou os números dos quatro rituais
 * adicionais (dano, cura, controle e híbrido) nem os custos de marca e da
 * Cartografia Carmesim. Para não inventar valores, apenas a Hemofagia carrega
 * dados fechados; os demais ficam configuráveis na mesa de combate (ver
 * `NeofitoCombat`). O texto explica a regra sem prometer números.
 */

export const NEOFITO_RITUAL_CATEGORY = 'Ritual de Sangue';

export type NeofitoRitualForm = 'common' | 'masked';

export function neofitoRituals(form: NeofitoRitualForm): readonly CharacterSheetAction[] {
  const masked = form === 'masked';
  const hemofagiaDamage = masked ? '6d8' : '4d8';
  const limit = masked ? 'Ação livre' : '2 rituais por turno';
  const cost = 'PV real (progressivo por turno)';

  return [
    {
      name: 'Hemofagia',
      category: NEOFITO_RITUAL_CATEGORY,
      action: 'Ritual',
      range: 'Inimigos marcados no alcance',
      damage: hemofagiaDamage,
      damageType: 'Sangue',
      cost,
      limit,
      description:
        `Atinge múltiplos inimigos marcados, causa ${hemofagiaDamage} de dano de Sangue em cada um e consome todas as marcas dos atingidos. ` +
        'Depois do dano, escolha Absorção (PV temporários iguais a 50% do dano total) ou Potencialização (bônus de 50% do dano total no próximo ritual). ' +
        'Não pode ser conjurado sem ao menos um alvo marcado. O sacrifício usa apenas PV reais.',
      mechanics: { kind: 'hemofagia', ritualKind: 'damage' },
    },
    {
      name: 'Ritual de Dano',
      category: NEOFITO_RITUAL_CATEGORY,
      action: 'Ritual',
      cost,
      limit,
      description:
        'Ritual ofensivo de sangue. Dano, alcance e resistência do alvo dependem da ficha final aprovada e são configurados na mesa de combate. ' +
        'Consome PV reais progressivos por turno; nunca PV temporários.',
      mechanics: { kind: 'ritual', ritualKind: 'damage' },
    },
    {
      name: 'Ritual de Cura',
      category: NEOFITO_RITUAL_CATEGORY,
      action: 'Ritual',
      cost,
      limit,
      description:
        'Ritual de cura e sobrevivência. A cura é recebida como PV temporários e nunca converte PV temporários em PV reais. ' +
        'Dados, alcance e demais valores dependem da ficha final aprovada e são configurados na mesa de combate.',
      mechanics: { kind: 'ritual', ritualKind: 'heal' },
    },
    {
      name: 'Ritual de Controle',
      category: NEOFITO_RITUAL_CATEGORY,
      action: 'Ritual',
      cost,
      limit,
      description:
        'Ritual de controle. Impõe uma condição por um número de rodadas definido na ficha final aprovada; a duração é configurada na mesa de combate. ' +
        'Consome PV reais progressivos por turno.',
      mechanics: { kind: 'ritual', ritualKind: 'control' },
    },
    {
      name: 'Ritual Híbrido',
      category: NEOFITO_RITUAL_CATEGORY,
      action: 'Ritual',
      cost,
      limit,
      description:
        'Ritual híbrido de dano e sustentação: dano e cura são resolvidos na mesma conjuração. ' +
        'Os valores dependem da ficha final aprovada e são configurados na mesa de combate. Consome PV reais progressivos por turno.',
      mechanics: { kind: 'ritual', ritualKind: 'hybrid' },
    },
  ];
}
