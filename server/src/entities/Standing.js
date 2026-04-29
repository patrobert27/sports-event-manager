const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Standing',
  tableName: 'standings',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        // punts
        points: {
            type: 'int',
            default: 0,
        },

        // partits jugats
        played_matches: {
            type: 'int',
            default: 0,
        },

        // partits guanyats
        won_matches: {
            type: 'int',
            default: 0,
        },

        // partits empatats
        drawn_matches: {
            type: 'int',
            default: 0,
        },

        // partits perduts
        lost_matches: {
            type: 'int',
            default: 0,
        },

        // gols a favor
        goals_for: {
            type: 'int',
            default: 0,
        },
        // gols en contra
        goals_against: {
            type: 'int',
            default: 0,
        },
  },

  relations: {
        team: {
            type: 'one-to-one',
            target: 'Team',
            joinColumn: {
                name: 'team_id',
            },
            nullable: false,
            onDelete: 'CASCADE',
        },
  },
});
