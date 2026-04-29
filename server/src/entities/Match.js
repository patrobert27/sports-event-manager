const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Match',
  tableName: 'matches',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        phase: {
            type: 'enum',
            enum: ['GROUP_STAGE', 'SEMIFINAL', 'FINAL'],
            default: 'GROUP_STAGE',
        },

        court_number: {
            type: 'int',
            nullable: true,
        },

        start_time: {
            type: 'timestamp',
            nullable: false,
        },

        end_time: {
            type: 'timestamp',
            nullable: true,
        },

        finished: {
            type: 'boolean',
            default: false,
        },

        goals_local: {
            type: 'int',
            default: 0,
        },

        goals_visitor: {
            type: 'int',
            default: 0,
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

        team_local: {
            type: 'many-to-one',
            target: 'Team',
            joinColumn: {
                name: 'team_local_id',
            },
            nullable: false,
        },

        team_visitor: {
            type: 'many-to-one',
            target: 'Team',
            joinColumn: {
                name: 'team_visitor_id',
            },
            nullable: false,
        },

        referee: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'referee_id',
            },
            nullable: true,
        },
 },
 
  // Constraint per assegurar que un equip no pot jugar contra si mateix
  checks: [
    {
      expression: `"team_local_id" <> "team_visitor_id"`,
    },
  ],
});
