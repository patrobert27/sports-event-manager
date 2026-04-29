class CreateMatchesTable1713957200000 {
  constructor() {
    this.name = 'CreateMatchesTable1713957200000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        competition_id INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
        phase match_phase_enum DEFAULT 'GROUP_STAGE',
        team_local_id INT NOT NULL REFERENCES teams(id),
        team_visitor_id INT NOT NULL REFERENCES teams(id),
        court_number INT CHECK (court_number > 0),
        referee_id INT REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        finished BOOLEAN DEFAULT FALSE,
        goals_local INT DEFAULT 0 CHECK (goals_local >= 0),
        goals_visitor INT DEFAULT 0 CHECK (goals_visitor >= 0),
        CHECK (team_local_id <> team_visitor_id)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS matches');
  }
}

module.exports = { CreateMatchesTable1713957200000 };