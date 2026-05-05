class CreateTeamsTable1713957170000 {
  constructor() {
    this.name = 'CreateTeamsTable1713957170000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        competition_id INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
        group_id INT REFERENCES groups(id),
        code VARCHAR(5) UNIQUE NULL, 
        -- per si volem un A1, A2, B1, B2, etc.
        captain_id INT NOT NULL REFERENCES users(id),
        teacher_id INT REFERENCES users(id),
        shield VARCHAR(255),
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS teams');
  }
}

module.exports = { CreateTeamsTable1713957170000 };