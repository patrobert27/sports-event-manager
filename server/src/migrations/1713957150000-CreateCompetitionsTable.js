class CreateCompetitionsTable1713957150000 {
  constructor() {
    this.name = 'CreateCompetitionsTable1713957150000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        start_time TIME,
        status competition_status_enum DEFAULT 'REGISTRATION',
        registration_deadline TIMESTAMP NOT NULL,
        registration_start TIMESTAMP NOT NULL,
        activity_id INT NOT NULL REFERENCES activities(id),
        field_id INT NOT NULL REFERENCES fields(id),
        creator_id INT NOT NULL REFERENCES users(id),
        available_courts INT NOT NULL CHECK (available_courts > 0)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS competitions');
  }
}

module.exports = { CreateCompetitionsTable1713957150000 };