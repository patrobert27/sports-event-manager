const { AppDataSource } = require("../config/data-source");
const User = require("../entities/User");
const Role = require("../entities/Role");
const authService = require("./authService");
const { ROLES } = require("../constants/roles");

/**
 * UserService
 * 
 * Aquesta classe s'encarrega de tota la lògica relacionada amb els usuaris:
 * llistar-los, cercar-los, actualitzar-los i gestionar els seus rols.
 */
class UserService {

	constructor() {
		this.userRepository = null;
		this.roleRepository = null;
	}

	// Mètode per obtenir el repositori d'usuaris
	getRepo() {
		if (!this.userRepository) {
			this.userRepository = AppDataSource.getRepository(User);
		}
		
		return this.userRepository;
	}

	// Mètode per obtenir el repositori de rols
	getRoleRepo() {
		if (!this.roleRepository) {
			this.roleRepository = AppDataSource.getRepository(Role);
		}
		
		return this.roleRepository;
	}

	/**
	 * Retorna una llista d'usuaris paginada.
	 * També permet cercar per nom, cognom o email.
	 */
	async listUsers({ page = 1, limit = 10, search } = {}) {
		// 1. Validacions i preparació
		const repository = this.getRepo();

		// Creem un QueryBuilder per poder fer consultes complexes
		const queryBuilder = repository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.role", "role") // Incloem la informació del rol
			.orderBy("user.created_at", "DESC"); // Els més nous primer

		// 2. Lògica de negoci (filtre de cerca)
		if (search && search.trim()) {
			const searchTerm = `%${search.trim().toLowerCase()}%`;
			
			// Busquem coincidències en nom, cognom o email
			queryBuilder.where(
				"LOWER(user.first_name) LIKE :term OR LOWER(user.last_name) LIKE :term OR LOWER(user.email) LIKE :term",
				{ 
					term: searchTerm 
				}
			);
		}

		// 3. Carrega de dades (paginació)
		const offsetCount = (page - 1) * limit;
		
		queryBuilder
			.skip(offsetCount)
			.take(limit);

		// Executem la consulta i obtenim els usuaris i el total de registres
		const [usersFound, totalCount] = await queryBuilder.getManyAndCount();

		// 4. Resposta (neteja de dades sensibles)
		// Fem servir el mètode de neteja del servei d'autenticació per treure el password
		const sanitizedUsers = usersFound.map((user) => {
			return authService.sanitizeUser(user);
		});

		return {
			data: sanitizedUsers,
			pagination: {
				total: totalCount,
				page: page,
				limit: limit,
				totalPages: Math.ceil(totalCount / limit)
			}
		};
	}

	/** 
	 * Retorna tots els rols del sistema.
	 */
	async listRoles() {
		// 1. Carrega de dades
		const rolesList = await this.getRoleRepo().find();
		
		// 2. Resposta
		return rolesList;
	}

	/** 
	 * Retorna la llista d'usuaris que són professors.
	 */
	async listTeachers() {
		// 1. Carrega de dades
		const repository = this.getRepo();

		const queryBuilder = repository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.role', 'role');

		// Filtrem només els que tenen el rol de professor
		queryBuilder.where(
			'role.name = :roleName', 
			{ 
				roleName: ROLES.TEACHER 
			}
		);

		const teachersFound = await queryBuilder.getMany();
		
		// 2. Resposta (neteja)
		return teachersFound.map((teacher) => {
			return authService.sanitizeUser(teacher);
		});
	}


	/** 
	 * Actualitza la informació d'un usuari segons el seu ID.
	 */
	async updateUser(userId, updateData) {
		// 1. Validacions i Carrega
		const repository = this.getRepo();
		
		const userToUpdate = await repository.findOne({ 
			where: { 
				id: userId 
			}, 
			relations: { 
				role: true 
			} 
		});
		
		if (!userToUpdate) {
			const notFoundError = new Error("Usuari no trobat");
			notFoundError.status = 404;
			throw notFoundError;
		}

		// 2. Lògica de negoci (canvi de rol)
		if (updateData.role_id !== undefined) {
			// Comprovem que el rol nou existeixi
			const newRole = await this.getRoleRepo().findOne({ 
				where: { 
					id: updateData.role_id 
				} 
			});
			
			if (!newRole) {
				const roleError = new Error("Rol no trobat");
				roleError.status = 404;
				throw roleError;
			}
			
			userToUpdate.role = newRole;
		}

		// 3. Lògica de negoci (camps editables)
		const editableFields = [
			"first_name", 
			"last_name", 
			"email"
		];
		
		for (const fieldName of editableFields) {
			if (updateData[fieldName] !== undefined) {
				userToUpdate[fieldName] = updateData[fieldName];
			}
		}

		// 4. Guardar dades
		const savedUser = await repository.save(userToUpdate);
		
		// 5. Resposta
		return authService.sanitizeUser(savedUser);
	}
}

module.exports = new UserService();
