const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'MatchdayPrediction',
  tableName: 'matchday_predictions',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        created_at: {
            type: 'timestamp',
            createDate: true,
        },
  },

  relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'CASCADE',
            nullable: false,
        },

        competition: {
            type: 'many-to-one',
            target: 'Competition',
            joinColumn: {
                name: 'competition_id',
            },
            onDelete: 'CASCADE',
            nullable: false,
        },

        selected_team: {
            type: 'many-to-one',
            target: 'Team',
            joinColumn: {
                name: 'selected_team_id',
            },
            nullable: false,
        },
  },

  // Unic contraint per asegurar que un usuari només pot fer una predicció per competició
  // Això no impedeix que un usuari pugui fer prediccions per diferents competicions, però sí que només pugui fer una predicció per competició
  indices: [
    {
      name: 'UQ_user_competition_prediction',
      unique: true,
      columns: ['user', 'competition'],
    },
  ],
});
