class CreateGroupsTable1713957160000 {
  constructor() {
    this.name = 'CreateGroupsTable1713957160000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        competition_id INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
        letter VARCHAR(1) NOT NULL,
        UNIQUE (competition_id, letter)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS groups');
  }
}

module.exports = { CreateGroupsTable1713957160000 };