const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Team',
  tableName: 'teams',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },

        code: {
            type: 'varchar',
            length: 5,
            unique: true,
            nullable: false,
        },
        // escudo
        shield: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },

        primary_color: {
            type: 'varchar',
            length: 7,
            nullable: true,
        },

        secondary_color: {
            type: 'varchar',
            length: 7,
            nullable: true,
        },

        created_at: {
            type: 'timestamp',
            createDate: true,
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

        group: {
            type: 'many-to-one',
            target: 'Group',
              joinColumn: {
                name: 'group_id',
              },
            nullable: true,
        },

        captain: {
            type: 'many-to-one',
            target: 'User',
              joinColumn: {
                name: 'captain_id',
             },
            nullable: false,
        },

        teacher: {
            type: 'many-to-one',
            target: 'User',
              joinColumn: {
                name: 'teacher_id',
              },
            nullable: true,
        },
  },
});
