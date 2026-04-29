class CreateUsersTable1713957140000 {
  constructor() {
    this.name = 'CreateUsersTable1713957140000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        photo VARCHAR(255),
        role_id INT NOT NULL REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}

module.exports = { CreateUsersTable1713957140000 };