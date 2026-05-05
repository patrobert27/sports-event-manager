const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * UserController
 * 
 * Aquest controlador s'encarrega de gestionar les peticions d'usuaris i rols.
 */
const userController = {

	/** 
	 * Retorna una llista d'usuaris amb paginació i opció de cerca.
	 */
	list: asyncHandler(async (request, response) => {
		// 1. Validacions i preparació de paràmetres
		// Assegurem que la pàgina i el límit siguin números vàlids
		const currentPage = Math.max(
			1, 
			parseInt(request.query.page) || 1
		);
		
		const itemsLimit = Math.max(
			1, 
			parseInt(request.query.limit) || 10
		);
		
		const searchTerm = request.query.search || '';

		// 2. Carrega de dades
		// Cridem al servei perquè ens busqui els usuaris
		const paginationResult = await userService.listUsers({ 
			page: currentPage, 
			limit: itemsLimit, 
			search: searchTerm 
		});

		// 3. Resposta
		response.status(200).json({
			success: true,
			message: "Usuaris llistats correctament",
			data: paginationResult
		});
	}),

	/** 
	 * Actualitza la informació d'un usuari (rol, email, etc.).
	 */
	update: asyncHandler(async (request, response) => {
		// 1. Validacions
		const { id } = request.params;
		const userId = Number(id);
		
		// 2. Lògica de negoci (actualització)
		const updatedUser = await userService.updateUser(
			userId, 
			request.body
		);

		// 3. Resposta
		response.status(200).json({
			success: true,
			message: "Usuari actualitzat correctament",
			data: updatedUser
		});
	}),

	/** 
	 * Retorna tots els rols disponibles al sistema (Admin, Estudiant, etc.).
	 */
	listRoles: asyncHandler(async (request, response) => {
		// 1. Carrega de dades
		const allRoles = await userService.listRoles();
		
		// 2. Resposta
		response.status(200).json({
			success: true,
			message: "Rols llistats correctament",
			data: allRoles
		});
	}),

	/** 
	 * Retorna només els usuaris que tenen el rol de professor.
	 */
	listTeachers: asyncHandler(async (request, response) => {
		// 1. Carrega de dades
		const teachersFound = await userService.listTeachers();
		
		// 2. Resposta
		response.status(200).json({
			success: true,
			message: 'Professors llistats correctament',
			data: teachersFound,
		});
	}),
};

module.exports = userController;
