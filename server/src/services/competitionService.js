const { AppDataSource } = require("../config/data-source");
const Competition = require("../entities/Competition");
const Activity = require("../entities/Activity");
const Field = require("../entities/Field");
const User = require("../entities/User");

/**
 * CompetitionService
 * 
 * Aquesta classe gestiona tota la lògica de les competicions (o jornades).
 * Aquí definim com es creen, com es llisten i com s'actualitzen les jornades esportives.
 */
class CompetitionService {
	
	// Repositoris auxiliars per a validacions
	getActivityRepo() {
		return AppDataSource.getRepository(Activity);
	}
	
	getFieldRepo() {
		return AppDataSource.getRepository(Field);
	}
	
	getUserRepo() {
		return AppDataSource.getRepository(User);
	}

	/**
	 * Crea una nova competició.
	 * Fem servir una transacció per assegurar que si falla un pas, no es guardi res a mitges.
	 */
	async createCompetition(competitionData, creatorId) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			// 1. Validacions inicials
			const { 
				name, 
				date, 
				start_time, 
				activity_id, 
				field_id, 
				available_courts, 
				registration_start, 
				registration_deadline 
			} = competitionData;

			// Comprovem que la data límit d'inscripció sigui abans de la jornada
			if (date && registration_deadline) {
				const eventDate = new Date(date);
				const deadlineDate = new Date(registration_deadline);
				
				if (deadlineDate > eventDate) {
					const dateError = new Error(
						"El tancament d'inscripcions no pot ser posterior a la data de l'esdeveniment."
					);
					dateError.status = 400;
					throw dateError;
				}
			}

			// Comprovem que l'inici del registre sigui abans que el tancament
			if (registration_start && registration_deadline) {
				const startDate = new Date(registration_start);
				const limitDate = new Date(registration_deadline);
				
				if (startDate >= limitDate) {
					const sequenceError = new Error(
						"L'inici d'inscripcions ha de ser anterior al tancament."
					);
					sequenceError.status = 400;
					throw sequenceError;
				}
			}

			// 2. Carrega de dades (Activitat i Instal·lació)
			// Busquem si l'esport triat existeix
			const activityEntity = await this.getActivityRepo().findOne({ 
				where: { 
					id: activity_id 
				} 
			});
			
			if (!activityEntity) {
				const activityError = new Error("L'activitat seleccionada no existeix.");
				activityError.status = 404;
				throw activityError;
			}

			let fieldEntity = null;
			let courtsCount = available_courts;

			// Si ens han passat una instal·lació, la busquem
			if (field_id) {
				fieldEntity = await this.getFieldRepo().findOne({ 
					where: { 
						id: field_id 
					} 
				});
				
				if (!fieldEntity) {
					const fieldError = new Error("La instal·lació seleccionada no existeix.");
					fieldError.status = 404;
					throw fieldError;
				}
				
				// Si no ens diuen quantes pistes, agafem les que té el camp per defecte
				if (!courtsCount || courtsCount === 0) {
					courtsCount = fieldEntity.number_of_courts || 1;
				}
			}

			// Busquem l'usuari que està creant la competició
			const creatorUser = await this.getUserRepo().findOne({ 
				where: { 
					id: creatorId 
				} 
			});

			// 3. Lògica de negoci (Creació de l'entitat)
			const newCompetition = transactionalEntityManager.create(Competition, {
				name: name,
				date: date || null,
				start_time: start_time || null,
				status: "REGISTRATION",
				available_courts: courtsCount || 1,
				registration_start: registration_start || new Date(),
				registration_deadline: registration_deadline || null,
				activity: activityEntity,
				field: fieldEntity,
				creator: creatorUser
			});

			// 4. Guardar dades
			const savedCompetition = await transactionalEntityManager.save(
				Competition, 
				newCompetition
			);

			// 5. Resposta
			// Tornem a carregar la competició per retornar-la amb totes les dades relacionades
			return this.getCompetitionById(
				savedCompetition.id, 
				transactionalEntityManager
			);
		});
	}

	/**
	 * Retorna la llista de totes les competicions guardades.
	 */
	async listCompetitions() {
		// 1. Carrega de dades
		const repository = AppDataSource.getRepository(Competition);

		// Busquem totes les jornades i incloem l'activitat, el camp i el creador
		const competitionsFound = await repository.find({
			relations: [
				"activity", 
				"field", 
				"creator"
			],
			order: { 
				id: "DESC" 
			}
		});

		// 2. Resposta
		// Netegem les dades sensibles de cada competició
		return competitionsFound.map((comp) => {
			return this._sanitizeCompetition(comp);
		});
	}

	/**
	 * Obté una competició pel seu ID.
	 */
	async getCompetitionById(id, entityManager = null) {
		// 1. Validacions i Càrrega
		const repository = entityManager 
			? entityManager.getRepository(Competition) 
			: AppDataSource.getRepository(Competition);

		const competitionFound = await repository.findOne({
			where: { 
				id: id 
			},
			relations: [
				"activity", 
				"field", 
				"creator"
			]
		});

		if (!competitionFound) {
			const notFoundError = new Error("No s'ha trobat cap competició amb aquest ID.");
			notFoundError.status = 404;
			throw notFoundError;
		}

		// 2. Resposta
		return this._sanitizeCompetition(competitionFound);
	}

	/**
	 * Actualitza la informació d'una competició.
	 */
	async updateCompetition(id, updateData) {
		const repository = AppDataSource.getRepository(Competition);

		// 1. Carrega de dades (Verifiquem que existeix)
		const competitionToUpdate = await repository.findOne({
			where: { 
				id: id 
			},
			relations: [
				"activity", 
				"field"
			]
		});

		if (!competitionToUpdate) {
			const updateError = new Error("No es pot actualitzar una competició inexistent.");
			updateError.status = 404;
			throw updateError;
		}

		// 2. Lògica de negoci (Actualització de relacions)
		if (updateData.activity_id) {
			competitionToUpdate.activity = { 
				id: updateData.activity_id 
			};
		}

		if (updateData.field_id) {
			competitionToUpdate.field = { 
				id: updateData.field_id 
			};
		}

		if (updateData.available_courts) {
			competitionToUpdate.available_courts = Number(updateData.available_courts);
		}

		// 3. Actualització de camps de text i dates
		const scalarFields = [
			"name", 
			"date", 
			"start_time", 
			"status", 
			"registration_start", 
			"registration_deadline"
		];

		scalarFields.forEach((fieldName) => {
			if (updateData[fieldName] === undefined) {
				return; 
			}

			const newValue = updateData[fieldName];

			// Tractament especial per a dates
			const isDateField = [
				"date", 
				"registration_start", 
				"registration_deadline"
			].includes(fieldName);

			if (isDateField) {
				if (!newValue || newValue === "") {
					competitionToUpdate[fieldName] = null;
				} else {
					const parsedDate = new Date(newValue);
					competitionToUpdate[fieldName] = isNaN(parsedDate.getTime()) 
						? null 
						: parsedDate;
				}
			} else {
				competitionToUpdate[fieldName] = newValue || null;
			}
		});

		// 4. Guardar dades
		const savedCompetition = await repository.save(competitionToUpdate);

		// 5. Resposta
		return this.getCompetitionById(savedCompetition.id);
	}

	/**
	 * Elimina una competició de la base de dades.
	 */
	async deleteCompetition(id) {
		// 1. Lògica d'eliminació
		const repository = AppDataSource.getRepository(Competition);
		const deleteResult = await repository.delete(id);

		// 2. Validació
		if (deleteResult.affected === 0) {
			const deleteError = new Error("No s'ha pogut eliminar la competició perquè no existeix.");
			deleteError.status = 404;
			throw deleteError;
		}

		// 3. Resposta
		return true;
	}

	/**
	 * Neteja dades sensibles (com passwords) abans d'enviar la resposta.
	 */
	_sanitizeCompetition(competition) {
		if (competition && competition.creator) {
			// Eliminem el password del creador
			delete competition.creator.password;
		}
		
		return competition;
	}
}

module.exports = new CompetitionService();
