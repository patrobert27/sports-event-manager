const express = require('express');
const fieldController = require('../controllers/fieldController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAbility = require('../middleware/checkAbility');

const router = express.Router();

// Llistar camps (visible per tothom autenticat)
router.get(
  '/', 
  authMiddleware, 
  fieldController.list
);

// Crear camp (només admins/gestors)
router.post(
  '/',
  authMiddleware,
  checkAbility('manage', 'Competition'),
  fieldController.create
);

// Actualitzar camp (només admins/gestors)
router.put(
  '/:id',
  authMiddleware,
  checkAbility('manage', 'Competition'),
  fieldController.update
);

// Eliminar camp (només admins/gestors)
router.delete(
  '/:id',
  authMiddleware,
  checkAbility('manage', 'Competition'),
  fieldController.delete
);

module.exports = router;
