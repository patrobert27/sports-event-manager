class CreateFieldsTable1713957130000 {
  constructor() {
    this.name = 'CreateFieldsTable1713957130000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(255),
        number_of_courts INT CHECK (number_of_courts > 0)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS fields');
  }
}

module.exports = { CreateFieldsTable1713957130000 };