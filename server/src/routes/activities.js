const express = require('express');
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAbility = require('../middleware/checkAbility');

// Creem el router d'Express per gestionar les rutes de les activitats (esports)
const router = express.Router();

/**
 * Rutes per a les Activitats
 * 
 * Aquí definim quines URLs responen a quines funcions del controlador
 * i quins permisos es necessiten per entrar-hi.
 */

// 1. Llistar totes les activitats
// Qualsevol usuari autenticat pot veure la llista d'esports
router.get(
  '/',
  authMiddleware,
  activityController.list
);

// 2. Crear una nova activitat
// Només els usuaris amb permís de gestió de competicions (Admins/Gestors) poden crear esports
router.post(
  '/',
  authMiddleware,
  checkAbility(
    'manage', 
    'Competition'
  ),
  activityController.create
);

// 3. Actualitzar una activitat existent
router.put(
  '/:id',
  authMiddleware,
  checkAbility(
    'manage', 
    'Competition'
  ),
  activityController.update
);

// 4. Eliminar una activitat
router.delete(
  '/:id',
  authMiddleware,
  checkAbility(
    'manage', 
    'Competition'
  ),
  activityController.delete
);

module.exports = router;
