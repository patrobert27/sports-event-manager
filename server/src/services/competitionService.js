const { AppDataSource } = require("../config/data-source");
const Competition = require("../entities/Competition");
const Activity = require("../entities/Activity");
const Field = require("../entities/Field");
const User = require("../entities/User");
const authService = require("./authService");

class CompetitionService {
	constructor() {
		this.repo = null;
		this.activityRepo = null;
		this.fieldRepo = null;
		this.userRepo = null;
	}

	getRepo() {
		if (!this.repo) {
            this.repo = AppDataSource.getRepository(Competition);
		}
		return this.repo;
	}

	getActivityRepo() {
		if (!this.activityRepo) {
            this.activityRepo = AppDataSource.getRepository(Activity);
		}
		return this.activityRepo;
	}

	getFieldRepo() {
		if (!this.fieldRepo) {
            this.fieldRepo = AppDataSource.getRepository(Field);
		}
		return this.fieldRepo;
	}

	getUserRepo() {
		if (!this.userRepo) {
            this.userRepo = AppDataSource.getRepository(User);
		}
		return this.userRepo;
	}

	/** Elimina dades sensibles com la contrasenya del creador */
    _sanitizeCompetition(comp) {
        if (!comp) {
            return comp;
        }
        // fem una còpia superficial per evitar modificar l’objecte de l’ORM
        const safe = { ...comp };
        if (safe.creator) {
            try {
                // authService.sanitizeUser elimina la contrasenya
                safe.creator = authService.sanitizeUser(safe.creator);
            } catch (e) {
                // fallback: eliminar la contrasenya directament
                const { password, ...rest } = safe.creator;
                safe.creator = rest;
            }
        }
        return safe;
    }

	/** Create a new Competition with validations and relations */
	async createCompetition(data, creatorId) {
		if (!data || typeof data !== "object") {
			const err = new Error("Invalid payload");
			err.status = 400;
			throw err;
		}

		const { name, available_courts, activity_id, field_id } = data;

		if (!name || !name.trim()) {
			const err = new Error("El campo 'name' es obligatorio");
			err.status = 400;
			throw err;
		}

		if (available_courts === undefined || available_courts === null) {
			const err = new Error("El campo 'available_courts' es obligatorio");
			err.status = 400;
			throw err;
		}

		const courts = Number(available_courts);
		if (!Number.isInteger(courts) || courts <= 0) {
			const err = new Error("'available_courts' debe ser un entero mayor que 0");
			err.status = 400;
			throw err;
		}

		if (!activity_id) {
			const err = new Error("El campo 'activity_id' es obligatorio");
			err.status = 400;
			throw err;
		}

		if (!field_id) {
			const err = new Error("El campo 'field_id' es obligatorio");
			err.status = 400;
			throw err;
		}

		// check referenced entities
		const activity = await this.getActivityRepo().findOne({ where: { id: activity_id } });
		if (!activity) {
			const err = new Error("Activity no encontrada");
			err.status = 404;
			throw err;
		}

		const field = await this.getFieldRepo().findOne({ where: { id: field_id } });
		if (!field) {
			const err = new Error("Field no encontrado");
			err.status = 404;
			throw err;
		}

		const creator = await this.getUserRepo().findOne({ where: { id: creatorId } });
		if (!creator) {
			const err = new Error("Creator (User) no encontrado");
			err.status = 404;
			throw err;
		}

		const repo = this.getRepo();

		const competition = repo.create({
			name: name.trim(),
			date: data.date || null,
			start_time: data.start_time || null,
			status: data.status || "REGISTRATION",
			registration_deadline: data.registration_deadline || null,
			available_courts: courts,
			activity: { id: activity_id },
			field: { id: field_id },
			creator: { id: creatorId },
		});

		const saved = await repo.save(competition);

		return this.getCompetitionById(saved.id);
	}

	/** List competitions with relations */
	async listCompetitions() {
		const comps = await this.getRepo().find({ relations: { activity: true, field: true, creator: true } });
		return comps.map(c => this._sanitizeCompetition(c));
	}

	/** Get competition by id, throw 404 if not found */
	async getCompetitionById(id) {
		const comp = await this.getRepo().findOne({ where: { id }, relations: { activity: true, field: true, creator: true } });
		if (!comp) {
			const err = new Error("Competition no encontrada");
			err.status = 404;
			throw err;
		}
		return this._sanitizeCompetition(comp);
	}

	/** Update competition fields allowed and validate relations */
	async updateCompetition(id, updateData) {
		const repo = this.getRepo();
		const comp = await repo.findOne({ where: { id } });
		if (!comp) {
			const err = new Error("Competition no encontrada");
			err.status = 404;
			throw err;
		}

		if (updateData.available_courts !== undefined) {
			const courts = Number(updateData.available_courts);
			if (!Number.isInteger(courts) || courts <= 0) {
				const err = new Error("'available_courts' debe ser un entero mayor que 0");
				err.status = 400;
				throw err;
			}
			comp.available_courts = courts;
		}

		if (updateData.activity_id !== undefined) {
			const activity = await this.getActivityRepo().findOne({ where: { id: updateData.activity_id } });
			if (!activity) {
				const err = new Error("Activity no encontrada");
				err.status = 404;
				throw err;
			}
			comp.activity = { id: updateData.activity_id };
		}

		if (updateData.field_id !== undefined) {
			const field = await this.getFieldRepo().findOne({ where: { id: updateData.field_id } });
			if (!field) {
				const err = new Error("Field no encontrado");
				err.status = 404;
				throw err;
			}
			comp.field = { id: updateData.field_id };
		}

		// Allowed scalar fields
		const allowed = [
			"name",
			"date",
			"start_time",
			"status",
			"registration_deadline",
		];

		for (const key of allowed) {
			if (updateData[key] !== undefined) {
				comp[key] = updateData[key];
			}
		}

		const saved = await repo.save(comp);
		return this.getCompetitionById(saved.id);
	}

	/** Delete competition following project pattern (hard delete) */
	async deleteCompetition(id) {
		const repo = this.getRepo();
		const comp = await repo.findOne({ where: { id } });
		if (!comp) {
			const err = new Error("Competition no encontrada");
			err.status = 404;
			throw err;
		}

		// hard delete using remove to respect relations cascade if configured
		await repo.remove(comp);
		return;
	}
}

module.exports = new CompetitionService();
