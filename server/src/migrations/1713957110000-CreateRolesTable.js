class CreateRolesTable1713957110000 {
  constructor() {
    this.name = 'CreateRolesTable1713957110000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS roles');
  }
}

module.exports = { CreateRolesTable1713957110000 };