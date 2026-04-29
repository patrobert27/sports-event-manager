const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Group',
  tableName: 'groups',

  columns: {
      id: {
        primary: true,
        type: 'int',
        generated: true,
      },

      letter: {
        type: 'varchar',
        length: 1,
        nullable: false,
     },
  },

  relations: {
      competition: {
        type: 'many-to-one',
        target: 'Competition',
        joinColumn: {
            name: 'competition_id',
        },
        onDelete: 'CASCADE',
        nullable: false,
     },
    },

  // Index per assegurar que no hi hagi dues grups amb la mateixa lletra dins de la mateixa competició
  // code a Team generara el codi A1, A2, B1, B2, etc. per a cada equip dins del grup, així que no podem tenir dues grups A dins de la mateixa competició
  indices: [
    {
      name: 'UQ_competition_letter',
      unique: true,
      columns: ['competition', 'letter'],
    },
  ],
});
