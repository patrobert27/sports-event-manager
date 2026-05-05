const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAbility = require('../middleware/checkAbility');

const router = express.Router();

// Llistar usuaris paginats amb cerca opcional (només admin)
router.get(
	'/',
	authMiddleware,
	checkAbility('manage', 'User'),
	checkAbility('manage', 'Competition'),
	userController.list
);

// Llistar professors per a usuaris autenticats
router.get(
	'/teachers',
	authMiddleware,
	userController.listTeachers
);

// Llistar rols disponibles (només admin)
router.get(
	'/roles',
	authMiddleware,
	checkAbility('manage', 'User'),
	checkAbility('manage', 'Competition'),
	userController.listRoles
);

// Actualitzar un usuari (només admin)
router.put(
	'/:id',
	authMiddleware,
	checkAbility('manage', 'User'),
	userController.update
);

module.exports = router;
