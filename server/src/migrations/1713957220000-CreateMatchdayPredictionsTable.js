class CreateMatchdayPredictionsTable1713957220000 {
  constructor() {
    this.name = 'CreateMatchdayPredictionsTable1713957220000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS matchday_predictions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        competition_id INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
        selected_team_id INT NOT NULL REFERENCES teams(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, competition_id)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS matchday_predictions');
  }
}

module.exports = { CreateMatchdayPredictionsTable1713957220000 };