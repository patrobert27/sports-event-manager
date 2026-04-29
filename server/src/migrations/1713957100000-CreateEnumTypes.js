class CreateEnumTypes1713957100000 {
  constructor() {
    this.name = 'CreateEnumTypes1713957100000';
  }

  async up(queryRunner) {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competition_status_enum') THEN
          CREATE TYPE competition_status_enum AS ENUM ('REGISTRATION', 'GROUP_STAGE', 'SEMIFINALS', 'FINAL_STAGE', 'FINISHED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_phase_enum') THEN
          CREATE TYPE match_phase_enum AS ENUM ('GROUP_STAGE', 'SEMIFINAL', 'FINAL');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_event_type_enum') THEN
          CREATE TYPE match_event_type_enum AS ENUM ('GOAL', 'CARD');
        END IF;
      END $$;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TYPE IF EXISTS match_event_type_enum');
    await queryRunner.query('DROP TYPE IF EXISTS match_phase_enum');
    await queryRunner.query('DROP TYPE IF EXISTS competition_status_enum');
  }
}

module.exports = { CreateEnumTypes1713957100000 };