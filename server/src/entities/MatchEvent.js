const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'MatchEvent',
  tableName: 'match_events',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        type: {
            type: 'enum',
            enum: ['GOAL', 'CARD'],
            default: 'GOAL',
        },

        description: {
            type: 'varchar',
            length: 50,
            nullable: false,
        },

        created_at: {
            type: 'timestamp',
            createDate: true,
        },
  },

  relations: {
        match: {
            type: 'many-to-one',
            target: 'Match',
            joinColumn: {
                name: 'match_id',
            },
            onDelete: 'CASCADE',
            nullable: false,
        },

        team_player: {
            type: 'many-to-one',
            target: 'TeamPlayer',
            joinColumn: {
                name: 'team_player_id',
            },
            nullable: false,
        },
  },
});
