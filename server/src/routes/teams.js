const express = require('express');
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAbility = require('../middleware/checkAbility');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * Rutes d'Equips
 * Utilitzem checkAbility amb strings per a una lògica de permisos neta i directa.
 * Les validacions d'instància (ex: ets el capità?) es fan al controlador/servei.
 */

// Llistar equips
router.get('/', authMiddleware, checkAbility('read', 'Team'), teamController.list);

// Crear equip
router.post('/', authMiddleware, checkAbility('create', 'Team'), teamController.create);

// Unir-se a un equip
router.post('/:id/join', authMiddleware, checkAbility('create', 'TeamPlayer'), teamController.join);

// Detalls de l'equip
router.get('/:id', authMiddleware, checkAbility('read', 'Team'), teamController.getById);

// Readiness (validació de jugadors)
router.get('/:id/readiness', authMiddleware, checkAbility('read', 'Team'), teamController.readiness);

// Actualitzar dades de l'equip
router.patch('/:id', authMiddleware, checkAbility('update', 'Team'), teamController.update);

// Eliminar equip
router.delete('/:id', authMiddleware, checkAbility('delete', 'Team'), teamController.delete);

// --- Gestió de Membres ---

// Acceptar membre
router.patch('/members/:playerRecordId/accept', authMiddleware, checkAbility('manage', 'TeamPlayer'), teamController.acceptMember);

// Eliminar membre / Rebutjar sol·licitud
router.delete('/members/:playerRecordId', authMiddleware, checkAbility('manage', 'TeamPlayer'), teamController.removeMember);

// Traspàs de capitania
router.patch('/:id/transfer-captain', authMiddleware, checkAbility('update', 'Team'), teamController.transferCaptaincy);

module.exports = router;
