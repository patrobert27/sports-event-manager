const express = require('express');
const competitionController = require('../controllers/competitionController');
const competitionService = require('../services/competitionService');
const authMiddleware = require('../middleware/authMiddleware');
const checkAbility = require('../middleware/checkAbility');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * Middleware per carregar una competició des de la BD
 * i afegir-la a req.competition per reutilitzar-la després
 */
const loadCompetition = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: 'Falta l’ID' });
	}

	const comp = await competitionService.getCompetitionById(Number(id));
	req.competition = comp;
	next();
});

// Llistar competicions (cal estar autenticat i tenir permís de lectura)
router.get(
	'/',
	authMiddleware,
	checkAbility('read', 'Competition'),
	competitionController.list
);

// Obtenir competició per ID (usa la instància carregada)
router.get(
	'/:id',
	authMiddleware,
	loadCompetition,
	checkAbility('read', 'Competition'),
	competitionController.getById
);

// Crear nova competició
router.post(
	'/',
	authMiddleware,
	checkAbility('create', 'Competition'),
	competitionController.create
);

// Actualitzar competició (PUT i PATCH comparteixen lògica)
router.put(
	'/:id',
	authMiddleware,
	loadCompetition,
	checkAbility('update', req => req.competition),
	competitionController.update
);

router.patch(
	'/:id',
	authMiddleware,
	loadCompetition,
	checkAbility('update', req => req.competition),
	competitionController.update
);

// Eliminar competició
router.delete(
	'/:id',
	authMiddleware,
	loadCompetition,
	checkAbility('delete', req => req.competition),
	competitionController.delete
);

module.exports = router;
