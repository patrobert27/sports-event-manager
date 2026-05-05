const { TableColumn } = require("typeorm");

class AddRegistrationStartToCompetitions1713957150001 {
    constructor() {
        this.name = 'AddRegistrationStartToCompetitions1713957150001';
    }

    async up(queryRunner) {
        // 1. Afegim la columna permetent nulls temporalment per a dades existents
        await queryRunner.query(`ALTER TABLE "competitions" ADD "registration_start" TIMESTAMP`);

        // 2. Omplim el camp amb la data actual per a les competicions existents (perquè sigui funcional immediatament)
        await queryRunner.query(`UPDATE "competitions" SET "registration_start" = CURRENT_TIMESTAMP WHERE "registration_start" IS NULL`);

        // 3. Posem la restricció NOT NULL un cop ja tenim dades
        await queryRunner.query(`ALTER TABLE "competitions" ALTER COLUMN "registration_start" SET NOT NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "competitions" DROP COLUMN "registration_start"`);
    }
}

module.exports = { AddRegistrationStartToCompetitions1713957150001 };
