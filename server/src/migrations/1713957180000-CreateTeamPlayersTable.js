class CreateTeamPlayersTable1713957180000 {
  constructor() {
    this.name = 'CreateTeamPlayersTable1713957180000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team_players (
        id SERIAL PRIMARY KEY,
        team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        position VARCHAR(100),
        confirmed BOOLEAN DEFAULT FALSE,
        UNIQUE (team_id, user_id)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS team_players');
  }
}

module.exports = { CreateTeamPlayersTable1713957180000 };