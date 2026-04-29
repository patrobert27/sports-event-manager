class CreateMatchEventsTable1713957210000 {
  constructor() {
    this.name = 'CreateMatchEventsTable1713957210000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS match_events (
        id SERIAL PRIMARY KEY,
        match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        team_player_id INT NOT NULL REFERENCES team_players(id),
        type match_event_type_enum DEFAULT 'GOAL',
        description VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS match_events');
  }
}

module.exports = { CreateMatchEventsTable1713957210000 };