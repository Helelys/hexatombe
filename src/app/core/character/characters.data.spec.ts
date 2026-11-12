import { CHARACTERS } from './characters.data';

describe('CHARACTERS', () => {
  const anne = CHARACTERS.find((character) => character.slug === 'anne-kent');

  it('reserva a ficha completa apenas para Anne Kent nesta etapa', () => {
    const withDossier = CHARACTERS.filter((character) => character.dossier).map(
      (character) => character.slug,
    );

    expect(withDossier).toEqual(['anne-kent']);
  });

  it('mantém a frase de Anne Kent', () => {
    expect(anne?.dossier?.quote).toBe('Se alguém precisa ficar de pé, serei eu.');
  });

  it('mantém os cinco atributos de Anne Kent', () => {
    expect(anne?.dossier?.attributes).toEqual([
      { key: 'AGI', value: 1 },
      { key: 'FOR', value: 4 },
      { key: 'INT', value: 1 },
      { key: 'PRE', value: 2 },
      { key: 'VIG', value: 4 },
    ]);
  });

  it('mantém as três habilidades de Anne Kent', () => {
    expect(anne?.dossier?.abilities).toEqual([
      {
        name: 'Base Plantada',
        action: 'Reação',
        limit: '1/rodada',
        description:
          'Ao sofrer dano de um ataque corpo a corpo, reduz o dano em 1d10+4. Se não se deslocou no turno anterior, reduz mais 3.',
      },
      {
        name: 'Arranco',
        action: 'Padrão',
        cost: '2 PE',
        description:
          'Após acertar Pancada, empurra o alvo 3 m. Se ele colidir com uma superfície, sofre +1d8 impacto. Fortitude DT 20 evita o deslocamento.',
      },
      {
        name: 'Ombro de Guarda',
        action: 'Livre',
        cost: '1 PE',
        description:
          'Escolhe um aliado adjacente; ele recebe +2 Defesa até o início do próximo turno de Anne. Uma vez por rodada.',
      },
    ]);
  });

  it('associa Anne Kent ao emblema de resistência', () => {
    expect(anne?.dossier?.emblem).toBe('bulwark');
  });

  it('ainda não possui ilustração', () => {
    expect(anne?.dossier).toBeDefined();
    expect(anne?.dossier?.portrait).toBeUndefined();
  });
});
