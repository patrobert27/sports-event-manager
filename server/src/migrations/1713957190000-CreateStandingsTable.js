class CreateStandingsTable1713957190000 {
  constructor() {
    this.name = 'CreateStandingsTable1713957190000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS standings (
        id SERIAL PRIMARY KEY,
        team_id INT NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
        points INT DEFAULT 0 CHECK (points >= 0),
        played_matches INT DEFAULT 0 CHECK (played_matches >= 0),
        won_matches INT DEFAULT 0 CHECK (won_matches >= 0),
        drawn_matches INT DEFAULT 0 CHECK (drawn_matches >= 0),
        lost_matches INT DEFAULT 0 CHECK (lost_matches >= 0),
        goals_for INT DEFAULT 0 CHECK (goals_for >= 0),
        goals_against INT DEFAULT 0 CHECK (goals_against >= 0)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS standings');
  }
}

module.exports = { CreateStandingsTable1713957190000 };