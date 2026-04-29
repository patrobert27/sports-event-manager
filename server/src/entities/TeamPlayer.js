const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'TeamPlayer',
  tableName: 'team_players',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        position: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },

        confirmed: {
            type: 'boolean',
            default: false,
        },
  },

    relations: {
        team: {
            type: 'many-to-one',
            target: 'Team',
            joinColumn: {
                name: 'team_id',
            },
            onDelete: 'CASCADE',
            nullable: false,
        },

        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'CASCADE',
            nullable: false,
        },
    },

  // Index per assegurar que un usuari no pugui estar en el mateix equip més d'una vegada
  // Això no impedeix que un usuari estigui en diferents equips, però sí que no pugui estar en el mateix equip més d'una vegada
  indices: [
    {
      name: 'UQ_team_user',
      unique: true,
      columns: ['team', 'user'],
    },
  ],
});
