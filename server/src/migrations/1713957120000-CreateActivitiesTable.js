class CreateActivitiesTable1713957120000 {
  constructor() {
    this.name = 'CreateActivitiesTable1713957120000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        min_players INT CHECK (min_players >= 0),
        max_players INT CHECK (max_players >= min_players)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS activities');
  }
}

module.exports = { CreateActivitiesTable1713957120000 };