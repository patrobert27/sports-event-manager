const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Activity',
  tableName: 'activities',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        name: {
            type: 'varchar',
            length: 100,
            unique: true,
            nullable: false,
        },

        color: {
            type: 'varchar',
            length: 20,
            nullable: false,
            default: '#4FA8F5',
        },

        min_players: {
            type: 'int',
            nullable: true,
        },

        max_players: {
            type: 'int',
            nullable: true,
        },
  },
});
